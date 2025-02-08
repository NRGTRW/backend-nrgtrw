import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";
import { deleteProduct, getAllProducts, getProductById } from "../controllers/productController.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Initialize multer – use .any() so that dynamic field names are captured.
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize AWS S3 client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION || "eu-central-1",
});

// Helper function to upload file to S3
async function uploadFileToS3(file, folder) {
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${folder}/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
  };

  const command = new PutObjectCommand(uploadParams);
  try {
    await s3.send(command);
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  } catch (error) {
    console.error(error);
    throw new Error("File upload failed");
  }
}

// ✅ Public Routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// ✅ Add New Product (Admin Only)
router.post(
  "/",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  async (req, res) => {
    try {
      const { name, description, price, categoryId, sizes, colors } = req.body;

      // Create product with TEMPORARY image URLs
      const newProduct = await prisma.product.create({
        data: {
          name,
          description,
          price,
          stock: 100,
          categoryId: Number(categoryId),
          imageUrl: "temp-main-image", // Temporary placeholder
          colors: {
            create: colors.map(color => ({
              colorName: color.colorName,
              imageUrl: "temp-color-image", // Temporary placeholder
              hoverImage: "temp-hover-image"
            }))
          },
          sizes: {
            create: sizes.map(size => ({
              size: { connect: { size } }
            }))
          }
        },
        include: { colors: true }
      });

      res.status(201).json({
        success: true,
        productId: newProduct.id,
        colorIds: newProduct.colors.map(c => c.id) // Send color IDs to frontend
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ success: false, message: "Product creation failed" });
    }
  }
);

// ✅ Upload/Update Images for Product (Admin Only)
// This endpoint now supports dynamic field names for color images:
// e.g., "colorImage_5" or "colorHoverImage_5" where "5" is the color ID.
router.post(
  "/upload-images",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  upload.any(), // capture all file uploads
  async (req, res) => {
    try {
      const { productId } = req.body;
      const files = req.files || [];
      
      // Find the product (including its colors)
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
        include: { colors: { orderBy: { id: "asc" } } }
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      const updatePromises = [];

      // Process main product image if provided
      const mainImageFile = files.find(file => file.fieldname === "mainImage");
      if (mainImageFile) {
        updatePromises.push(
          uploadFileToS3(mainImageFile, "products").then(url =>
            prisma.product.update({
              where: { id: product.id },
              data: { imageUrl: url }
            })
          )
        );
      }

      // Process main product hover image if provided
      const hoverImageFile = files.find(file => file.fieldname === "hoverImage");
      if (hoverImageFile) {
        updatePromises.push(
          uploadFileToS3(hoverImageFile, "products").then(url =>
            prisma.product.update({
              where: { id: product.id },
              data: { hoverImage: url }
            })
          )
        );
      }

      // Process dynamic color image files
      for (const file of files) {
        if (file.fieldname.startsWith("colorImage_")) {
          const colorId = Number(file.fieldname.split("_")[1]);
          updatePromises.push(
            uploadFileToS3(file, "colors").then(url =>
              prisma.color.update({
                where: { id: colorId },
                data: { imageUrl: url }
              })
            )
          );
        }
        if (file.fieldname.startsWith("colorHoverImage_")) {
          const colorId = Number(file.fieldname.split("_")[1]);
          updatePromises.push(
            uploadFileToS3(file, "colors").then(url =>
              prisma.color.update({
                where: { id: colorId },
                data: { hoverImage: url }
              })
            )
          );
        }
      }

      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: "Images updated successfully"
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Image upload failed"
      });
    }
  }
);

// ✅ Update Product (Admin Only)
// This endpoint updates product text details and color names.
router.put(
  "/:id",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const { name, description, price, categoryId, colors } = req.body;

    try {
      // Wrap all operations in a transaction for atomicity.
      await prisma.$transaction(async (tx) => {
        // 1. Update the main product fields.
        await tx.product.update({
          where: { id: Number(id) },
          data: {
            name,
            description,
            price,
            categoryId: Number(categoryId),
          },
        });

        if (colors && Array.isArray(colors)) {
          // 2. Get the list of IDs for colors that should remain.
          const updatedColorIds = colors
            .filter((color) => color.id)
            .map((color) => Number(color.id));

          // 3. Delete any colors that are associated with this product but not included in the payload.
          await tx.color.deleteMany({
            where: {
              productId: Number(id),
              ...(updatedColorIds.length > 0 ? { id: { notIn: updatedColorIds } } : {}),
            },
          });

          // 4. Process each color from the payload.
          for (const color of colors) {
            if (color.id) {
              // Update an existing color.
              // Only update fields that are provided (so we don't override with undefined).
              const updateData = {
                colorName: color.colorName,
                ...(typeof color.imageUrl !== "undefined" && { imageUrl: color.imageUrl }),
                ...(typeof color.hoverImage !== "undefined" && { hoverImage: color.hoverImage }),
              };

              await tx.color.update({
                where: { id: Number(color.id) },
                data: updateData,
              });
            } else {
              // Create a new color record.
              // If the image values are not provided, default to placeholders.
              await tx.color.create({
                data: {
                  colorName: color.colorName,
                  imageUrl: color.imageUrl || "temp-color-image", // default if missing
                  hoverImage: color.hoverImage || "temp-hover-image", // default if missing
                  productId: Number(id),
                },
              });
            }
          }
        }
      });

      // Re-fetch the product with its updated colors.
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
      // Log the full error for debugging.
      console.error("Error updating product:", error);
      return res.status(500).json({
        success: false,
        message: "Product update failed: " + error.message,
      });
    }
  }
);



// ✅ Delete Product (Admin Only)
router.delete(
  "/:id",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  deleteProduct
);

export default router;
;
