import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";
import { deleteProduct, getAllProducts, getProductById } from "../controllers/productController.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Initialize multer using memory storage.
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize AWS S3 client.
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION || "eu-central-1",
});

// Helper function: Upload a file to S3.
async function uploadFileToS3(file, folder) {
  console.log("Uploading file:", file.originalname);
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folder}/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
  };

  const command = new PutObjectCommand(uploadParams);
  try {
    await s3.send(command);
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
    console.log("File uploaded successfully:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("File upload failed: " + error.message);
  }
}

// -------------------- Public Routes --------------------
router.get("/", getAllProducts);
router.get("/:id", getProductById);

/**
 * POST "/" – Create New Product (Admin Only)
 *
 * Expects a multipart/form-data request containing text fields:
 *   - name, description, price, categoryId, sizes, colors
 *   (If sizes or colors are sent as JSON strings, they are parsed.)
 *
 * (Optional file uploads are ignored here, so fallback images are stored.)
 *
 * Returns the new product (with generated color IDs).
 */
router.post(
  "/",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  upload.any(),
  async (req, res) => {
    try {
      // Parse text fields.
      let { name, description, price, categoryId, sizes, colors } = req.body;
      if (typeof sizes === "string") sizes = JSON.parse(sizes);
      if (typeof colors === "string") colors = JSON.parse(colors);

      // Define fallback image URLs.
      const fallbackMain = "temp-main-image";
      const fallbackColor = "temp-color-image";
      const fallbackHover = "temp-hover-image";

      // Prepare the colors array (using order to help with later image matching).
      const processedColors = colors.map((color, index) => ({
        colorName: color.colorName,
        imageUrl: fallbackColor,
        hoverImage: fallbackHover,
        position: index,
      }));

      // Create the product with nested creation for colors and sizes.
      const newProduct = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          stock: 100,
          categoryId: Number(categoryId),
          imageUrl: fallbackMain,
          colors: { create: processedColors },
          sizes: {
            create: sizes.map((size) => ({
              size: { connect: { size } },
            })),
          },
        },
        include: { colors: { orderBy: { position: "asc" } } },
      });

      res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ success: false, message: "Product creation failed" });
    }
  }
);

/**
 * PUT "/:id/add-color" – Add a New Color to an Existing Product (Admin Only)
 *
 * Expects a JSON (or URL-encoded) body: { "colorName": "New Color Name" }
 *
 * Returns the new color record.
 */
router.put(
  "/:id/add-color",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  async (req, res) => {
    const { id } = req.params; // product id
    const { colorName } = req.body;
    if (!colorName) {
      return res.status(400).json({ success: false, message: "colorName is required" });
    }
    const fallbackColor = "temp-color-image";
    const fallbackHover = "temp-hover-image";
    try {
      const newColor = await prisma.color.create({
        data: {
          colorName,
          imageUrl: fallbackColor,
          hoverImage: fallbackHover,
          product: { connect: { id: Number(id) } },
          position: 0,
        },
      });
      res.status(200).json({ success: true, color: newColor });
    } catch (error) {
      console.error("Error adding color:", error);
      res.status(500).json({ success: false, message: "Failed to add color" });
    }
  }
);

/**
 * POST "/upload-images" – Update Images for a Product (Admin Only)
 *
 * Expects a FormData payload with:
 *   - A text field "productId"
 *   - Optional file fields:
 *       • "mainImage" for the product’s main image.
 *       • For each color, file fields named "colorImage_{index}" and/or "colorHoverImage_{index}"
 *         (where {index} is the order in which the color was created).
 */
router.post(
  "/upload-images",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  upload.any(),
  async (req, res) => {
    try {
      console.log("Upload-images endpoint hit");
      console.log("Request body:", req.body);
      console.log("Files received:", req.files);

      const { productId } = req.body;
      const files = req.files || [];
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
        include: { colors: { orderBy: { position: "asc" } } },
      });
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      const updatePromises = [];
      const mainImageFile = files.find(file => file.fieldname === "mainImage");
      if (mainImageFile) {
        const mainImageUrl = await uploadFileToS3(mainImageFile, "products");
        updatePromises.push(
          prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: mainImageUrl },
          })
        );
      }
      // Note: The hoverImage update has been removed because the Product model does not have a hoverImage field.
      // For each color (by order), update its images if files are provided.
      product.colors.forEach((colorRecord, index) => {
        const colorImageFile = files.find(file => file.fieldname === `colorImage_${index}`);
        const colorHoverImageFile = files.find(file => file.fieldname === `colorHoverImage_${index}`);
        if (colorImageFile) {
          updatePromises.push(
            uploadFileToS3(colorImageFile, "colors").then(url =>
              prisma.color.update({
                where: { id: colorRecord.id },
                data: { imageUrl: url },
              })
            )
          );
        }
        if (colorHoverImageFile) {
          updatePromises.push(
            uploadFileToS3(colorHoverImageFile, "colors").then(url =>
              prisma.color.update({
                where: { id: colorRecord.id },
                data: { hoverImage: url },
              })
            )
          );
        }
      });
      await Promise.all(updatePromises);
      res.status(200).json({ success: true, message: "Images updated successfully" });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, message: "Image upload failed" });
    }
  }
);

/**
 * PUT "/:id" – Update Product Details and (optionally) Images (Admin Only)
 *
 * This endpoint updates product text fields and color text fields.
 * It also accepts file uploads (using field names "mainImage",
 * "colorImage_{colorId}", "colorHoverImage_{colorId}") to update image URLs.
 */
router.put(
  "/:id",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  upload.any(),
  async (req, res) => {
    const { id } = req.params;
    try {
      let { name, description, price, categoryId, colors } = req.body;
      if (typeof colors === "string") colors = JSON.parse(colors);
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: Number(id) },
          data: {
            name,
            description,
            price: parseFloat(price),
            categoryId: Number(categoryId),
          },
        });
        if (colors && Array.isArray(colors)) {
          const updatedColorIds = colors.filter(color => color.id).map(color => Number(color.id));
          await tx.color.deleteMany({
            where: {
              productId: Number(id),
              ...(updatedColorIds.length > 0 ? { id: { notIn: updatedColorIds } } : {}),
            },
          });
          for (const color of colors) {
            if (color.id) {
              const updateData = {
                colorName: color.colorName,
                ...(color.imageUrl ? { imageUrl: color.imageUrl } : {}),
                ...(color.hoverImage ? { hoverImage: color.hoverImage } : {}),
              };
              await tx.color.update({
                where: { id: Number(color.id) },
                data: updateData,
              });
            } else {
              await tx.color.create({
                data: {
                  colorName: color.colorName,
                  imageUrl: color.imageUrl || "temp-color-image",
                  hoverImage: color.hoverImage || "temp-hover-image",
                  productId: Number(id),
                },
              });
            }
          }
        }
      });

      // Process file uploads.
      const files = req.files || [];
      const updatePromises = [];
      const mainImageFile = files.find(file => file.fieldname === "mainImage");
      if (mainImageFile) {
        updatePromises.push(
          uploadFileToS3(mainImageFile, "products").then(url =>
            prisma.product.update({
              where: { id: Number(id) },
              data: { imageUrl: url },
            })
          )
        );
      }
      // Removed hoverImage update for product.
      files.forEach(file => {
        if (file.fieldname.startsWith("colorImage_")) {
          const parts = file.fieldname.split("_");
          if (parts.length < 2) return;
          const colorId = Number(parts[1]);
          if (!colorId) return;
          updatePromises.push(
            uploadFileToS3(file, "colors").then(url =>
              prisma.color.update({
                where: { id: colorId },
                data: { imageUrl: url },
              })
            )
          );
        }
        if (file.fieldname.startsWith("colorHoverImage_")) {
          const parts = file.fieldname.split("_");
          if (parts.length < 2) return;
          const colorId = Number(parts[1]);
          if (!colorId) return;
          updatePromises.push(
            uploadFileToS3(file, "colors").then(url =>
              prisma.color.update({
                where: { id: colorId },
                data: { hoverImage: url },
              })
            )
          );
        }
      });
      await Promise.all(updatePromises);
      const finalProduct = await prisma.product.findUnique({
        where: { id: Number(id) },
        include: { colors: { orderBy: { id: "asc" } } },
      });
      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        updatedProduct: finalProduct,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        success: false,
        message: "Product update failed: " + error.message,
      });
    }
  }
);

// DELETE Product (Admin Only)
router.delete(
  "/:id",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  deleteProduct
);

export default router;
