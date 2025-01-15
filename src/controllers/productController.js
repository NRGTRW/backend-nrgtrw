import prisma from "../prisma/client.js";

export const getProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

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

    const product = await prisma.product.create({
      data: {
        name,
        price,
        imageUrl
      }
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};
