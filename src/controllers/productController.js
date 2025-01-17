import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        sizes: true,
        colors: true,
      },
    });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products." });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
export const getProductById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error); // Use error middleware for handling
  }
};


export const createProduct = async (req, res, next) => {
  try {
    const { name, price, imageUrl } = req.body;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        sizes: true,
        colors: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message);
    res.status(500).json({ error: "Failed to fetch the product." });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, description, category, sizes, colors } = req.body;

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        description,
        category,
        sizes: {
          create: sizes.map((size) => ({ size })),
        },
        colors: {
          create: colors.map((color) => ({
            colorName: color.colorName,
            imageUrl: color.imageUrl,
            hoverImage: color.hoverImage,
          })),
        },
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ error: "Failed to create product." });
  }
};
