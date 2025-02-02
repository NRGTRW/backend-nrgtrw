// cartController.js
import cartService from "../services/cartService.js";

/**
 * Controller: GET /api/cart
 * Returns a flattened array of cart items.
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id; // Set by your auth middleware
    const cart = await cartService.getCartByUser(userId);

    // Flatten fields so the frontend can directly use them.
    const formattedCart = cart.map((item) => ({
      cartItemId: item.id,
      productId: item.productId,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      quantity: item.quantity,
      // Flatten product data:
      name: item.product?.name || "Unknown Product",
      price: item.product?.price ?? 0,
      imageUrl: item.product?.imageUrl || "/default-image.png",
    }));

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("❌ Failed to load cart:", error);
    res.status(500).json({ message: "Failed to load cart." });
  }
};

/**
 * Controller: POST /api/cart
 * Adds or updates an item in the user's cart.
 */
export const addToCart = async (req, res) => {
  console.log("📥 Incoming Add to Cart Request:", req.body);

  // 1. Extract userId from the JWT (req.user.id), not from the request body
  const userId = req.user?.id;

  const { productId, name, price, selectedSize, selectedColor, quantity } = req.body;

  // 2. Validate required fields (excluding userId, because we decode it from token)
  if (!productId || !name || !price || !quantity) {
    console.error("❌ Missing fields:", { productId, name, price, quantity });
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Use the service to upsert the cart item
    const newCartItem = await cartService.addToCart(userId, {
      productId,
      name,
      price,
      selectedSize,
      selectedColor,
      quantity,
    });
    return res.status(201).json(newCartItem);
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

/**
 * Controller: DELETE /api/cart/:cartItemId
 * Removes a single cart item from the user's cart.
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.cartItemId, 10);

    if (isNaN(cartItemId)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    await cartService.removeFromCart(userId, cartItemId);
    res.status(200).json({ message:""});
  } catch (error) {
    console.error("[CART] Delete error:", error);

    // Prisma error code P2025 means "Record not found"
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(500).json({ message: "Failed to remove item from cart." });
  }
};
