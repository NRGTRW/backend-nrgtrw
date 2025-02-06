import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Initialize AWS S3 Client
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION || "eu-central-1",
});

/**
 * Helper function to upload multiple image files to S3.
 * Returns an array of public URLs.
 */
const uploadImagesToS3 = async (files) => {
  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("S3 bucket not configured");
  }
  const uploadPromises = files.map(async (file) => {
    const fileKey = `ProductImages/${Date.now()}-${uuidv4()}-${file.originalname}`;
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    await s3.send(new PutObjectCommand(uploadParams));
    return `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  });
  return Promise.all(uploadPromises);
};

export const createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId, sizes, colors } = req.body;

  // Handle image uploads
  const imagePaths = [];
  req.files.forEach((file) => {
    imagePaths.push(file.path); // Or if you're uploading to S3, use the S3 URL
  });

  // Handle colors
  const colorData = colors.map((color, index) => ({
    colorName: color.colorName,
    imageUrl: imagePaths[index * 2], // Main image URL
    hoverImage: imagePaths[index * 2 + 1], // Hover image URL
  }));

  // Proceed with product creation logic
  const createdProduct = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      categoryId,
      images: imagePaths, // Images for the product
      sizes: { create: sizes.map((sizeId) => ({ size: { connect: { id: sizeId } } })) },
      colors: { create: colorData },
    },
  });

  res.status(201).json({ message: "Product created successfully", data: createdProduct });
};



/**
 * Get all products.
 * Includes related product sizes and colors.
 */
export const getAllProducts = async (req, res) => {
  try {
    console.log("Fetching products from the database...");
    const products = await prisma.product.findMany({
      include: {
        sizes: {  // ✅ Corrected: "sizes" exists in your Prisma schema
          include: { size: true }
        },
        colors: true,
        category: true,  // ✅ If category is needed
      }
    });
    console.log("✅ Products fetched:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Get a single product by its ID.
 * Transforms product sizes to a flat array for easier frontend handling.
 */
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        sizes: {  // ✅ Use "sizes" (Correct relation)
          include: { size: true }
        },
        colors: true,
        category: true,  // ✅ Include category if needed
      }
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
};

/**
 * Delete an existing product.
 * Also removes associated images from S3.
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Parse the product ID from the URL parameter
    const productId = parseInt(id, 10);
    console.log(`Received DELETE request for product with ID: ${productId}`);

    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.log(`Product with ID ${productId} not found.`);
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`Product found for deletion:`, product);

    // Determine which images need to be deleted (if any)
    const imagesToDelete = (product.images && Array.isArray(product.images))
      ? product.images
      : (product.imageUrl ? [product.imageUrl] : []);
    
    console.log(`Images to delete:`, imagesToDelete);

    // Delete images from S3
    for (const imageUrl of imagesToDelete) {
      try {
        console.log(`Attempting to delete image: ${imageUrl}`);
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1); // Remove the leading '/'

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

    // Delete the product from the database
    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
    });

    console.log(`Product deleted successfully:`, deletedProduct);

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
