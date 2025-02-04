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
    const formattedCart = cart.map((item) => {
      if (!item.product) {
        console.warn(`⚠️ Warning: Product ID ${item.productId} not found.`);
        return null;
      }
    
      return {
        cartItemId: item.id,
        productId: item.productId,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: item.quantity,
        name: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
      };
    }).filter(Boolean);

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

  const userId = req.user?.id;
  const { productId, name, price, selectedSize, selectedColor, quantity } = req.body;

  // Validate required fields
  if (!productId || !name || !price || !quantity) {
    console.error("❌ Missing fields:", { productId, name, price, quantity });
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const newCartItem = await cartService.addToCart(userId, {
      productId,
      name,
      price,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      quantity,
    });

    return res.status(201).json(newCartItem);
  } catch (error) {
    console.error("❌ Error adding to cart:", error.message);
    return res.status(500).json({ message: "Internal Server Error.", details: error.message });
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
