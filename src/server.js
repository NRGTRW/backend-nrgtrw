import express from "express";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(bodyParser.json({ limit: "50mb" })); // Set a large body size limit to handle big base64 strings

// Log bucket name for debugging
console.log("Bucket Name:", process.env.AWS_S3_BUCKET_NAME);

// AWS S3 setup
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION || "eu-central-1"
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const fallbackImage = "https://example.com/fallback.jpg";

// Helper to upload an image to S3
const uploadToS3 = async (fileName, base64Data, mimeType) => {
  const buffer = Buffer.from(base64Data.split(",")[1], "base64");
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: mimeType
    // Commented out ACL due to bucket restrictions
  });

  try {
    await s3.send(command);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "eu-central-1"}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("❌ Error uploading image to S3:", error);
    throw error;
  }
};

// Endpoint to create product and upload images
app.post("/create-product", async (req, res) => {
  const { product } = req.body;

  // Log the incoming request to check its structure
  console.log("Received Product Data:", req.body);

  try {
    if (!product || !product.category) {
      return res.status(400).json({ message: "Product category is required" });
    }

    // Find or create category
    const category = await prisma.category.upsert({
      where: { name: product.category },
      update: {},
      create: { name: product.category }
    });

    // Get image URLs for the product and its colors
    const uploadedImages = await Promise.all([
      uploadToS3(
        product.imageUrl.name,
        product.imageUrl.buffer,
        product.imageUrl.mimetype
      ),
      ...product.colors.flatMap((color) => [
        uploadToS3(color.image.name, color.image.buffer, color.image.mimetype),
        uploadToS3(
          color.hoverImage.name,
          color.hoverImage.buffer,
          color.hoverImage.mimetype
        )
      ])
    ]);

    const [productImageUrl, ...colorImageUrls] = uploadedImages;

    // Fixing data structure to ensure imageUrl is a single string, not an array
    const colorData = product.colors.map((color, index) => ({
      colorName: color.colorName || "Default Color",
      imageUrl: colorImageUrls[index * 2] || fallbackImage, // Main color image
      hoverImage: colorImageUrls[index * 2 + 1] || fallbackImage // Hover image
    }));

    // Handle product image upload

    // Create product entry in database
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: { connect: { id: category.id } },
        imageUrl: productImageUrl,
        colors: {
          create: colorData // Pass the fixed color data structure with single string URLs
        },
        sizes: {
          create: product.sizes.map((size) => ({
            size: { connect: { id: size.id } }
          }))
        },
        updatedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: createdProduct
    });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Start server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
