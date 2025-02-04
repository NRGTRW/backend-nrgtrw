import wishlistService from "../services/wishlistService.js";

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;
    // Fetch wishlist via the service layer
    const wishlistItems = await wishlistService.getWishlistByUser(userId);

    // Format the wishlist items as needed by the frontend
    const formattedWishlist = wishlistItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      quantity: item.quantity,
      product: {
        name: item.product?.name,
        price: item.product?.price,
        imageUrl: item.product?.imageUrl,
        colors: item.product?.colors,
      },
    }));

    console.log("✅ Wishlist Data Sent to Frontend:", formattedWishlist);
    res.status(200).json(formattedWishlist);
  } catch (error) {
    console.error("❌ Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to fetch wishlist." });
  }
};

export const addItemToWishlist = async (req, res) => {
  try {
    console.log("📩 Incoming Wishlist Request:", req.body);
    console.log("🔑 User ID from Auth Middleware:", req.user?.id);

    const userId = req.user?.id;
    const { productId, selectedSize, selectedColor, quantity } = req.body;

    if (!productId || isNaN(Number(productId))) {
      console.error("❌ Invalid Product ID:", productId);
      return res.status(400).json({ error: "Valid Product ID is required." });
    }

    if (!userId) {
      console.error("❌ User ID not found in request.");
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const newItem = await wishlistService.addToWishlist(userId, {
      productId: Number(productId),
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      quantity: quantity || 1,
    });

    console.log("✅ Item added to Wishlist:", newItem);
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

    // The service returns an object with a "count" property from deleteMany
    const result = await wishlistService.removeFromWishlist(userId, wishlistId);

    if (result.count && result.count > 0) {
      res.status(200).json({ message: "Item removed successfully." });
    } else {
      res.status(404).json({ message: "Item not found in your wishlist." });
    }
  } catch (error) {
    console.error("🚨 Failed to remove item from wishlist:", error.message);
    res.status(500).json({ message: "Failed to remove item from wishlist." });
  }
};
