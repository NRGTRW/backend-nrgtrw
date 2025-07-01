import { PrismaClient } from "@prisma/client"; // ✅ Ensure Prisma is imported
const prisma = new PrismaClient(); // ✅ Ensure a new instance is created

/**
 * Fetches all cart items for a specific user,
 * including relevant product fields via translations.
 */
export const getCartByUser = async (userId) => {
  try {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            price: true, // Price is directly on the Product model
            stock: true,
            colors: true,
            sizes: {
              include: {
                size: true // Include the related size model
              }
            },
            // Include translations to extract product name and imageUrl
            translations: true
          }
        }
      }
    });
  } catch (error) {
    console.error("[DB] Error fetching cart:", error);
    throw new Error("Database error while fetching cart.");
  }
};

export const addToCart = async (userId, item) => {
  try {
    console.log("📥 Attempting to add to cart:", item);

    if (!prisma.cartItem) {
      throw new Error(
        "Prisma cartItem model is undefined. Check your Prisma schema."
      );
    }

    // Find if the item already exists in the cart (same product, size, and color)
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId: item.productId,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null
      }
    });

    // If it exists, update the quantity instead of creating a new entry
    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + item.quantity, 99); // ✅ Max quantity of 99

      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });

      console.log("✅ Updated cart item quantity:", updatedCartItem);
      return updatedCartItem;
    }

    // If it doesn't exist, create a new cart entry
    const newCartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId: item.productId,
        name: item.name, // Store the product name in the cart item
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        quantity: item.quantity || 1
      }
    });

    console.log("✅ Successfully added new item to cart:", newCartItem);
    return newCartItem;
  } catch (error) {
    console.error("❌ Prisma Error while adding to cart:", error);
    throw new Error(
      `Database error while adding item to cart: ${error.message}`
    );
  }
};

/**
 * Removes a specific cart item, ensuring it's owned by the given user.
 */
export const removeFromCart = async (userId, cartItemId) => {
  try {
    return await prisma.cartItem.delete({
      // If your `CartItem` model has a composite PK on (id, userId),
      // this will work. If not, use deleteMany() with `where: { id: cartItemId, userId }`.
      where: {
        id: cartItemId,
        userId
      }
    });
  } catch (error) {
    console.error("[DB] Delete error details:", error);
    throw error; // Propagate error to controller
  }
};

/**
 * Clears the entire cart for a user.
 */
export const clearCart = async (userId) => {
  return await prisma.cartItem.deleteMany({
    where: { userId }
  });
};

/**
 * Updates the quantity of a cart item; example usage for partial updates.
 */
export const updateCartQuantity = async (userId, productId, quantity) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true } // Optionally fetch the latest price
  });

  return await prisma.cartItem.updateMany({
    where: { userId, productId },
    data: {
      quantity
      // If you want to synchronize price changes:
      // price: product?.price || 0,
    }
  });
};

export default {
  getCartByUser,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartQuantity
};
