import wishlistService from "../services/wishlistService.js";

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlist = await wishlistService.getWishlistByUser(userId);
    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Failed to load wishlist:", error.message);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to load wishlist. Please try again later." 
    });
  }
};

export const addItemToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, selectedSize, selectedColor, quantity } = req.body;

    if (!productId || isNaN(Number(productId))) {
      return res.status(400).json({ message: "Valid Product ID is required." });
    }

    const newItem = await wishlistService.addToWishlist(userId, {
      productId: Number(productId),
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      quantity: quantity || 1,
    });

    res.status(201).json({ item: newItem });
  } catch (error) {
    console.error("🚨 Wishlist Error:", error);
    res.status(400).json({
      error: "Bad request",
      message: error.message || "Could not add item to wishlist.",
    });
  }
};

export const removeItemFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { wishlistId } = req.params;

    if (!wishlistId) {
      return res.status(400).json({ message: "Wishlist ID is required for removal." });
    }

    const result = await wishlistService.removeFromWishlist(userId, wishlistId);

    if (result) {
      res.status(200).json({ message: "Item removed successfully." });
    } else {
      res.status(404).json({ message: "Item not found in your wishlist." });
    }
  } catch (error) {
    console.error("🚨 Failed to remove item from wishlist:", error.message);
    res.status(500).json({ message: "Failed to remove item from wishlist." });
  }
};
