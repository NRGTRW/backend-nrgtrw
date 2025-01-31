import cartService from "../services/cartService.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCartByUser(userId);

    const formattedCart = cart.map((item) => ({
      cartItemId: item.id, // ✅ Explicitly use `id` as `cartItemId`
      productId: item.productId,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      quantity: item.quantity,
      userId: item.userId,
    }));

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("❌ Failed to load cart:", error);
    res.status(500).json({ message: "Failed to load cart." });
  }
};



export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, selectedSize, selectedColor, quantity } = req.body;

    const newCartItem = await cartService.addToCart(userId, {
      productId,
      selectedSize,
      selectedColor,
      quantity,
    });

    res.status(201).json({ message: "Item added to cart.", item: newCartItem });
  } catch (error) {
    res.status(400).json({ message: "Could not add item to cart." });
  }
};

// controllers/cartController.js
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.cartItemId);

    if (isNaN(cartItemId)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    // Attempt to delete the cart item
    await cartService.removeFromCart(userId, cartItemId);
    res.status(200).json({ message: "Item removed from your cart." });

  } catch (error) {
    console.error("[CART] Delete error:", error);

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(500).json({ message: "Failed to remove item from cart." });
  }
};