import cartService from "../services/cartService.js";
import prisma from "../../prisma/lib/prisma.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCartByUser(userId);

    const formattedCart = cart
      .map((item) => {
        if (!item.product) {
          console.warn(`⚠️ Warning: Product ID ${item.productId} not found.`);
          return null;
        }

        // Extract translation for the desired language (e.g., "en")
        const translation =
          item.product.translations.find((t) => t.language === "en") ||
          (item.product.translations.length > 0 && item.product.translations[0]) ||
          {};

        return {
          cartItemId: item.id,
          productId: item.productId,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          quantity: item.quantity,
          name: translation.name || "No name",
          price: item.product.price,
          imageUrl: translation.imageUrl || ""
        };
      })
      .filter(Boolean);

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error("❌ Failed to load cart:", error);
    res.status(500).json({ message: "Failed to load cart." });
  }
};

export const addToCart = async (req, res) => {
  console.log("📥 Incoming Add to Cart Request:", req.body);

  const userId = req.user?.id;
  // Remove price from required fields since it's not stored in CartItem.
  const { productId, name, selectedSize, selectedColor, quantity } = req.body;

  if (!productId || !name || !quantity) {
    console.error("❌ Missing fields:", { productId, name, quantity });
    return res.status(400).json({ message: "Missing required fields." });
  }

  console.log("🛒 Checking if product exists in DB...");
  try {
    const newCartItem = await cartService.addToCart(userId, {
      productId,
      name,
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
      quantity
    });

    return res.status(201).json(newCartItem);
  } catch (error) {
    console.error("❌ Error adding to cart:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error.", details: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.cartItemId, 10);

    if (isNaN(cartItemId)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    await cartService.removeFromCart(userId, cartItemId);
    res.status(200).json({ message: "Item removed from cart." });
  } catch (error) {
    console.error("[CART] Delete error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(500).json({ message: "Failed to remove item from cart." });
  }
};
