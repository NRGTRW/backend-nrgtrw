import prisma from "../prisma/client.js";

// Retrieve Cart
export const getCart = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true }
    });

    res.status(200).json(cartItems);
  } catch (error) {
    next(error);
  }
};

// Add to Cart
export const addToCart = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const { productId, quantity } = req.body;

    const cartItem = await prisma.cart.create({
      data: {
        userId,
        productId,
        quantity
      }
    });

    res.status(201).json(cartItem);
  } catch (error) {
    next(error);
  }
};
