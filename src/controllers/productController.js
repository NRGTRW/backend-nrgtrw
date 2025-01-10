import prisma from "../utils/prisma.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true } // Include category data in the response
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price, stock, categoryId }
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};
