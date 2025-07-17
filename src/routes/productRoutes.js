import { PrismaClient } from "@prisma/client";
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import express from "express";
import multer from "multer";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";

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

// GET all products.
router.get("/", async (req, res) => {
  try {
    console.log("Fetching products from the database...");
    const products = await prisma.product.findMany({
      include: {
        sizes: { include: { size: true } },
        colors: true,
        category: true,
        translations: true, // Include translations for frontend/editing
      },
    });
    console.log("✅ Products fetched:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET product by ID.
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        sizes: { include: { size: true } },
        colors: true,
        category: true,
        translations: true, // Include translations
      },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const formattedProduct = {
      ...product,
      sizes: product.sizes.map((ps) => ps.size),
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to fetch product." });
    }
  }
});

/**
 * POST "/" – Create New Product (Admin Only)
 *
 * Expects a multipart/form-data request with text fields:
 *   - enName, enDescription, bgName, bgDescription, price, categoryId, sizes, colors
 * (If sizes or colors are sent as JSON strings, they are parsed.)
 *
 * Creates nested translation records for English and Bulgarian.
 */
router.post(
  "/",
  authenticate,
  requireAdmin,
  upload.any(),
  async (req, res) => {
    try {
      let {
        enName,
        enDescription,
        bgName,
        bgDescription,
        price,
        categoryId,
        sizes,
        colors,
      } = req.body;
      if (typeof sizes === "string") sizes = JSON.parse(sizes);
      if (typeof colors === "string") colors = JSON.parse(colors);

      // Fallback: If separate translation fields are missing, fall back to name/description.
      enName = enName || req.body.name;
      enDescription = enDescription || req.body.description;
      bgName = bgName || req.body.name;
      bgDescription = bgDescription || req.body.description;

      // Use a fallback empty array for req.files.
      const imagePaths = [];
      (req.files || []).forEach((file) => {
        imagePaths.push(file.path);
      });

      // Process colors assuming two images per color.
      const colorData = colors.map((color, index) => ({
        colorName: color.colorName,
        imageUrl: imagePaths[index * 2] || "temp-color-image",
        hoverImage: imagePaths[index * 2 + 1] || "temp-hover-image",
        position: index,
      }));

      // Fallback main image for translations.
      const fallbackMain = imagePaths[0] || "temp-main-image";

      const newProduct = await prisma.product.create({
        data: {
          price: parseFloat(price),
          stock: 100,
          // Connect category via relation.
          category: { connect: { id: Number(categoryId) } },
          colors: { create: colorData },
          sizes: {
            create: sizes.map((size) => ({
              size: { connect: { size } },
            })),
          },
          translations: {
            create: [
              {
                language: "en",
                name: enName,
                description: enDescription,
                imageUrl: fallbackMain,
              },
              {
                language: "bg",
                name: bgName,
                description: bgDescription,
                imageUrl: fallbackMain,
              },
            ],
          },
        },
        include: {
          colors: { orderBy: { position: "asc" } },
          translations: true,
        },
      });

      res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
      console.error("Error creating product:", error);
      res
        .status(500)
        .json({ success: false, message: "Product creation failed" });
    }
  }
);

/**
 * PUT "/:id" – Update Product Details and (optionally) Images (Admin Only)
 *
 * Updates product fields (price, category via relation) and nested translation records.
 * File uploads for color images are processed.
 */
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  upload.any(),
  async (req, res) => {
    const { id } = req.params;
    try {
      let {
        enName,
        enDescription,
        bgName,
        bgDescription,
        price,
        categoryId,
        colors,
      } = req.body;
      if (typeof colors === "string") colors = JSON.parse(colors);

      await prisma.$transaction(async (tx) => {
        // Update product fields.
        await tx.product.update({
          where: { id: Number(id) },
          data: {
            price: parseFloat(price),
            category: { connect: { id: Number(categoryId) } },
          },
        });

        const fallbackMain = "temp-main-image";

        // Upsert English translation.
        await tx.productTranslation.upsert({
          where: { productId_language: { productId: Number(id), language: "en" } },
          update: {
            ...(enName ? { name: enName } : {}),
            ...(enDescription ? { description: enDescription } : {}),
          },
          create: {
            productId: Number(id),
            language: "en",
            name: enName,
            description: enDescription,
            imageUrl: fallbackMain,
          },
        });

        // Upsert Bulgarian translation.
        await tx.productTranslation.upsert({
          where: { productId_language: { productId: Number(id), language: "bg" } },
          update: {
            ...(bgName ? { name: bgName } : {}),
            ...(bgDescription ? { description: bgDescription } : {}),
          },
          create: {
            productId: Number(id),
            language: "bg",
            name: bgName,
            description: bgDescription,
            imageUrl: fallbackMain,
          },
        });

        // Update colors.
        if (colors && Array.isArray(colors)) {
          const updatedColorIds = colors
            .filter((color) => color.id)
            .map((color) => Number(color.id));
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

      // Process file uploads for color images.
      const files = req.files || [];
      const updatePromises = [];
      files.forEach((file) => {
        if (file.fieldname.startsWith("colorImage_")) {
          const parts = file.fieldname.split("_");
          if (parts.length < 2) return;
          const colorId = Number(parts[1]);
          if (!colorId) return;
          updatePromises.push(
            uploadFileToS3(file, "colors").then((url) =>
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
            uploadFileToS3(file, "colors").then((url) =>
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
        include: { colors: { orderBy: { id: "asc" } }, translations: true },
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
// DELETE Product (Admin Only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const productId = parseInt(id, 10);
      console.log(`Received DELETE request for product with ID: ${productId}`);

      // Check if the product exists.
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        console.log(`Product with ID ${productId} not found.`);
        return res.status(404).json({ error: "Product not found" });
      }
      console.log("Product found for deletion:", product);

      // If you previously stored any images on S3 (via colors or translations),
      // you might want to delete them here.
      // (This example assumes you may have stored a top-level imageUrl,
      //  but if not, you can remove the following block.)
      const imagesToDelete =
        product.images && Array.isArray(product.images)
          ? product.images
          : product.imageUrl
          ? [product.imageUrl]
          : [];
      console.log("Images to delete:", imagesToDelete);
      for (const imageUrl of imagesToDelete) {
        try {
          console.log(`Attempting to delete image: ${imageUrl}`);
          const url = new URL(imageUrl);
          const key = url.pathname.substring(1);
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: key,
            })
          );
          console.log(`Successfully deleted image: ${imageUrl}`);
        } catch (deleteError) {
          console.error(`Error deleting image ${imageUrl}:`, deleteError.message);
        }
      }

      // Delete dependent records first to satisfy foreign key constraints.
      // Delete associated colors.
      await prisma.color.deleteMany({ where: { productId: productId } });
      // Delete associated translations.
      await prisma.productTranslation.deleteMany({ where: { productId: productId } });
      // Delete associated sizes (if applicable—adjust the model name as needed).
      await prisma.productSize.deleteMany({ where: { productId: productId } });

      // Now delete the product.
      const deletedProduct = await prisma.product.delete({
        where: { id: productId },
      });
      console.log("Product deleted successfully:", deletedProduct);
      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error.message);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);


/**
 * POST "/upload-images" – Upload Product Images (Admin Only)
 *
 * This endpoint handles image uploads (main image and color images) after a product is created.
 * It expects a multipart/form-data request containing:
 *  - A "productId" field
 *  - Optional "mainImage" file
 *  - Color image files with field names like "colorImage_0", "colorHoverImage_0", etc.
 */
router.post(
  "/upload-images",
  authenticate,
  requireAdmin,
  upload.any(),
  async (req, res) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, message: "Product ID is required" });
      }

      // Verify product exists.
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
      });
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const files = req.files || [];
      const updatePromises = [];

      // Process mainImage (if provided) and update all translations with the main image URL.
      const mainImageFile = files.find((file) => file.fieldname === "mainImage");
      if (mainImageFile) {
        const mainImageUrl = await uploadFileToS3(mainImageFile, "products/main");
        updatePromises.push(
          prisma.productTranslation.updateMany({
            where: { productId: Number(productId) },
            data: { imageUrl: mainImageUrl },
          })
        );
      }

      // Process color images based on field names.
      files.forEach((file) => {
        if (file.fieldname.startsWith("colorImage_")) {
          const parts = file.fieldname.split("_");
          if (parts.length < 2) return;
          const index = Number(parts[1]);
          updatePromises.push(
            uploadFileToS3(file, "products/colors").then(async (url) => {
              await prisma.color.updateMany({
                where: {
                  productId: Number(productId),
                  position: index,
                },
                data: { imageUrl: url },
              });
            })
          );
        } else if (file.fieldname.startsWith("colorHoverImage_")) {
          const parts = file.fieldname.split("_");
          if (parts.length < 2) return;
          const index = Number(parts[1]);
          updatePromises.push(
            uploadFileToS3(file, "products/colors").then(async (url) => {
              await prisma.color.updateMany({
                where: {
                  productId: Number(productId),
                  position: index,
                },
                data: { hoverImage: url },
              });
            })
          );
        }
      });

      await Promise.all(updatePromises);
      res.status(200).json({ success: true, message: "Images uploaded successfully" });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ success: false, message: "Image upload failed" });
    }
  }
);

export default router;
