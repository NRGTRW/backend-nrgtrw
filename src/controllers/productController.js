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
 * Create a new product.
 * Expects product details in req.body and image files (up to 10) via req.files.
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    if (!name || !description || !price || !stock) {
      return res.status(400).json({ error: "Name, description, price, and stock are required" });
    }

    // Parse numeric fields
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : null;

    // Handle image uploads: use uploaded files or a provided imageUrl in the body
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadImagesToS3(req.files);
    } else if (req.body.imageUrl) {
      images = [req.body.imageUrl];
    } else {
      return res.status(400).json({ error: "At least one image is required" });
    }
    const primaryImage = images[0];

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice,
        stock: parsedStock,
        categoryId: parsedCategoryId,
        imageUrl: primaryImage,
        images: images, // This field accepts an array of image URLs (as JSON)
      },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(500).json({ error: "Failed to create product" });
  }
};

/**
 * Delete an existing product.
 * Also removes associated images from S3.
 */
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productId = parseInt(id, 10);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    // Determine images to delete (using images array if available, otherwise fallback to imageUrl)
    const imagesToDelete = (product.images && Array.isArray(product.images))
      ? product.images
      : (product.imageUrl ? [product.imageUrl] : []);

    for (const imageUrl of imagesToDelete) {
      try {
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1); // Remove leading '/'
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
          })
        );
      } catch (deleteError) {
        console.error(`Error deleting image ${imageUrl}:`, deleteError.message);
      }
    }
    await prisma.product.delete({
      where: { id: productId },
    });
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
