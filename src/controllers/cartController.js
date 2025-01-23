import cartService from "../services/cartService.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCartByUser(userId);
    res.status(200).json(cart);
  } catch (error) {
    console.error("Failed to load cart:", error);
    res.status(500).json({ message: "Failed to load cart." });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const item = req.body;
    const newItem = await cartService.addToCart(userId, item);
    res.status(201).json(newItem);
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    res.status(400).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, selectedSize, selectedColor } = req.body;
    const result = await cartService.removeFromCart(userId, {
      productId,
      selectedSize,
      selectedColor,
    });
    res.status(200).json({ message: "Item removed successfully.", result });
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart." });
  }
};

export const moveToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, selectedSize, selectedColor } = req.body;
    await cartService.removeFromCart(userId, { productId, selectedSize, selectedColor });
    const newItem = await wishlistService.addToWishlist(userId, { productId, selectedSize, selectedColor });
    res.status(200).json(newItem);
  } catch (error) {
    console.error("Failed to move item to wishlist:", error);
    res.status(500).json({ message: "Failed to move item to wishlist." });
  }
};
