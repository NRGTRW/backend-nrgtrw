import wishlistService from "../services/wishlistService.js";
import prisma from "../../prisma/lib/prisma.js";
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
    console.log("📩 Incoming Wishlist Request:", req.body);

    const userId = req.user.id;
    const { productId, selectedSize, selectedColor, quantity } = req.body;

    // Validate required fields
    if (!productId || isNaN(Number(productId))) {
      console.error("❌ Invalid Product ID:", productId);
      return res.status(400).json({ message: "Valid Product ID is required." });
    }

    const newItem = await wishlistService.addToWishlist(userId, {
      productId: Number(productId), // ✅ Ensure correct type
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      quantity: quantity || 1,
    });

    console.log("✅ Wishlist Item Added:", newItem);

    res.status(201).json({
      message: "Item added to wishlist successfully.",
      item: newItem,
    });
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
    const userId = req.user.id; // Extract user ID from the authenticated user
    const { wishlistId } = req.params; // Get wishlistId from URL params

    if (!wishlistId) {
      return res.status(400).json({ message: "Wishlist ID is required for removal." });
    }

    // Ensure we are deleting the correct item belonging to the user
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

