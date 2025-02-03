// cartController.js
import cartService from "../services/cartService.js";
import prisma from "../../prisma/lib/prisma.js";

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


export const addToCart = async (req, res) => {
  console.log("📥 Incoming Add to Cart Request:", req.body);

  const userId = req.user?.id;
  const { productId, name, price, selectedSize, selectedColor, quantity } = req.body;

  // 1️⃣ Validate Required Fields
  if (!productId || !name || !price || !quantity) {
    console.error("❌ Missing fields:", { productId, name, price, quantity });
    return res.status(400).json({ message: "Missing required fields." });
  }

  // 2️⃣ Check if Product Exists
  console.log("🛒 Checking if product exists in DB...");
  try {
    const productExists = await prisma.product.findUnique({
      where: { id: parseInt(productId, 10) },
      select: { id: true, name: true, price: true },
    });

    if (!productExists) {
      console.error(`❌ Product with ID ${productId} does not exist.`);
      return res.status(404).json({ message: `Product with ID ${productId} not found.` });
    }

    console.log(`✅ Product exists:`, productExists);

    // 3️⃣ Log Cart Data Before Saving
    console.log("🛍️ Adding to cart:", {
      userId,
      productId,
      name,
      price,
      selectedSize: selectedSize || "None",
      selectedColor: selectedColor || "None",
      quantity,
    });

    // 4️⃣ Save to Cart
    const newCartItem = await cartService.addToCart(userId, {
      productId,
      name,
      price,
      selectedSize,
      selectedColor,
      quantity,
    });

    console.log("✅ Successfully added to cart:", newCartItem);
    return res.status(201).json(newCartItem);
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    return res.status(500).json({ message: "Internal Server Error." });
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
    res.status(200).json({ message:""});
  } catch (error) {
    console.error("[CART] Delete error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(500).json({ message: "Failed to remove item from cart." });
  }
};
