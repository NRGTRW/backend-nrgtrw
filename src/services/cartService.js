// cartService.js
import prisma from "../../prisma/lib/prisma.js";

/**
 * Fetches all cart items for a specific user,
 * including relevant product fields (name, price, imageUrl, etc.).
 */
export const getCartByUser = async (userId) => {
  try {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            imageUrl: true,
            colors: true,
            sizes: { select: { size: true } }
          },
        },
      },
    });
  } catch (error) {
    console.error("[DB] Error fetching cart:", error);
    throw new Error("Database error while fetching cart.");
  }
};

/**
 * Adds or updates a cart item (upsert) for a given user & product combination.
 */
export const addToCart = async (userId, item) => {
  try {
    return await prisma.cartItem.upsert({
      where: {
        userId_productId_selectedSize_selectedColor: {
          userId,
          productId: item.productId,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        },
      },
      create: {
        userId,
        productId: item.productId,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        quantity: item.quantity,
      },
      update: {
        quantity: item.quantity,
      },
    });
  } catch (error) {
    console.error("[DB] Error adding item to cart:", error);
    throw new Error("Database error while adding item to cart.");
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
        userId,
      },
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
    where: { userId },
  });
};

/**
 * Updates the quantity of a cart item; example usage for partial updates.
 */
export const updateCartQuantity = async (userId, productId, quantity) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true }, // Optionally fetch the latest price
  });

  return await prisma.cartItem.updateMany({
    where: { userId, productId },
    data: {
      quantity,
      // If you want to synchronize price changes:
      // price: product?.price || 0,
    },
  });
};

export default {
  getCartByUser,
  addToCart,
  removeFromCart,
  clearCart,
  updateCartQuantity,
};
