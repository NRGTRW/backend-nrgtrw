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

    // Validate the incoming request
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const newItem = await wishlistService.addToWishlist(userId, {
      productId,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      quantity: quantity || 1,
    });

    res.status(201).json({
      message: "Item added to wishlist successfully.",
      item: newItem,
    });
  } catch (error) {
    console.error("Failed to add item to wishlist:", error.message);
    res.status(400).json({ 
      error: "Bad request", 
      message: error.message || "Failed to add item to wishlist. Please check the input and try again." 
    });
  }
};

export const removeItemFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the authenticated user
    const { productId } = req.params; // Get productId from the URL
    const { selectedSize, selectedColor } = req.body; // Optional details

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required for removal.' });
    }

    // Call service to remove the item
    const result = await wishlistService.removeFromWishlist(userId, {
      productId: parseInt(productId, 10),
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
    });

    if (result.count > 0) {
      res.status(200).json({ message: 'Item removed successfully.' });
    } else {
      res.status(404).json({ message: 'Item not found in wishlist.' });
    }
  } catch (error) {
    console.error('Failed to remove item from wishlist:', error.message);
    res.status(500).json({ message: 'Failed to remove item from wishlist.' });
  }
};
