import express from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";
import { deleteProduct, getAllProducts, getProductById } from "../controllers/productController.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Initialize multer
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


// ✅ Upload Images for Product (Admin Only)
// ✅ Upload Images for Product (Admin Only)
router.post(
  "/upload-images",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "hoverImage", maxCount: 1 },
    { name: "colorImages", maxCount: 10 },
    { name: "colorHoverImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { productId } = req.body;
      const files = req.files || {};

      // Validate product ID and get colors
      const product = await prisma.product.findUnique({
        where: { id: Number(productId) },
        include: { colors: { orderBy: { id: "asc" } } }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Upload main image
      const updatePromises = [];

      if (files.mainImage?.[0]) {
        updatePromises.push(
          uploadFileToS3(files.mainImage[0], "products")
            .then(url => prisma.product.update({
              where: { id: product.id },
              data: { imageUrl: url }
            }))
        );
      }

      // Process hover images for colors
      if (files.hoverImage?.[0]) {
        updatePromises.push(
          uploadFileToS3(files.hoverImage[0], "products")
            .then(url => {
              // Update all colors' hoverImage field with the uploaded hoverImage
              return prisma.color.updateMany({
                where: { productId: product.id },
                data: { hoverImage: url },
              });
            })
        );
      }

      // Process color images in order-sensitive way
      if (files.colorImages && files.colorHoverImages) {
        const colorEntries = product.colors;
        const colorImages = files.colorImages;
        const colorHoverImages = files.colorHoverImages;

        colorEntries.forEach((color, index) => {
          const imageFile = colorImages[index];
          const hoverFile = colorHoverImages[index];

          if (imageFile && hoverFile) {
            updatePromises.push(
              Promise.all([
                uploadFileToS3(imageFile, "colors"),
                uploadFileToS3(hoverFile, "colors")
              ]).then(([imageUrl, hoverImageUrl]) => 
                prisma.color.update({
                  where: { id: color.id },
                  data: { 
                    imageUrl,
                    hoverImage: hoverImageUrl 
                  }
                })
              )
            );
          }
        });
      }

      // Wait for all image uploads to finish
      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }
  }
);


// ✅ Delete Product (Admin Only)
router.delete(
  "/products/:id",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  deleteProduct
);

export default router;
