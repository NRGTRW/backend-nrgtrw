import wishlistService from '../services/wishlistService.js';

export const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is added to req.user via auth middleware
    const wishlist = await wishlistService.getWishlistByUser(userId);
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addItemToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const item = req.body;
    const newItem = await wishlistService.addToWishlist(userId, item);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeItemFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, selectedSize, selectedColor } = req.body;
    const result = await wishlistService.removeFromWishlist(userId, {
      productId,
      selectedSize,
      selectedColor,
    });
    res.status(200).json({ message: 'Item removed successfully.', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
