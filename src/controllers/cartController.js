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
export const addToCart = async (req, res) => {
  const { userId, productId, quantity, selectedSize, selectedColor } = req.body;

  try {
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
        selectedSize,
        selectedColor
      }
    });
    res.status(201).json(cartItem);
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart." });
  }
};
