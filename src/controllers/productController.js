import { PrismaClient } from "@prisma/client";
import {
  S3Client,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION || "eu-central-1"
});

export const createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId, sizes, colors } =
    req.body;

  const imagePaths = [];
  req.files.forEach((file) => {
    imagePaths.push(file.path);
  });

  const colorData = colors.map((color, index) => ({
    colorName: color.colorName,
    imageUrl: imagePaths[index * 2],
    hoverImage: imagePaths[index * 2 + 1]
  }));

  const createdProduct = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      categoryId,
      images: imagePaths,
      sizes: {
        create: sizes.map((sizeId) => ({ size: { connect: { id: sizeId } } }))
      },
      colors: { create: colorData }
    }
  });

  res
    .status(201)
    .json({ message: "Product created successfully", data: createdProduct });
};

export const getAllProducts = async (req, res) => {
  try {
    console.log("Fetching products from the database...");
    const products = await prisma.product.findMany({
      include: {
        sizes: {
          include: { size: true }
        },
        colors: true,
        category: true
      }
    });
    console.log("✅ Products fetched:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        sizes: {
          include: { size: true }
        },
        colors: true,
        category: true
      }
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const formattedProduct = {
      ...product,
      sizes: product.sizes.map((ps) => ps.size)
    };

    return res.status(200).json(formattedProduct);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Failed to fetch product." });
    }
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const productId = parseInt(id, 10);
    console.log(`Received DELETE request for product with ID: ${productId}`);

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      console.log(`Product with ID ${productId} not found.`);
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(`Product found for deletion:`, product);

    const imagesToDelete =
      product.images && Array.isArray(product.images)
        ? product.images
        : product.imageUrl
          ? [product.imageUrl]
          : [];

    console.log(`Images to delete:`, imagesToDelete);

    for (const imageUrl of imagesToDelete) {
      try {
        console.log(`Attempting to delete image: ${imageUrl}`);
        const url = new URL(imageUrl);
        const key = url.pathname.substring(1);

        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key
          })
        );
        console.log(`Successfully deleted image: ${imageUrl}`);
      } catch (deleteError) {
        console.error(`Error deleting image ${imageUrl}:`, deleteError.message);
      }
    }

    const deletedProduct = await prisma.product.delete({
      where: { id: productId }
    });

    console.log(`Product deleted successfully:`, deletedProduct);

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
