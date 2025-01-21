import wishlistService from "../services/wishlistService.js";

export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await wishlistService.getWishlistByUser(userId);
    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error.message);
    res.status(500).json({ message: "Error fetching wishlist." });
  }
};

export const addItemToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const item = req.body;
    const newItem = await wishlistService.addToWishlist(userId, item);
    const updatedWishlist = await wishlistService.getWishlistByUser(userId);
    res.status(201).json(updatedWishlist);
  } catch (error) {
    console.error("Error adding item to wishlist:", error.message);
    res.status(400).json({ message: "Error adding item to wishlist." });
  }
};

export const removeItemFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, selectedSize, selectedColor } = req.body;
    await wishlistService.removeFromWishlist(userId, {
      productId,
      selectedSize,
      selectedColor,
    });
    const updatedWishlist = await wishlistService.getWishlistByUser(userId);
    res.status(200).json(updatedWishlist);
  } catch (error) {
    console.error("Error removing item from wishlist:", error.message);
    res.status(500).json({ message: "Error removing item from wishlist." });
  }
};
