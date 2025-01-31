import prisma from "../../prisma/lib/prisma.js";

export const getCartByUser = async (userId) => {
  try {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: { 
        product: {
          include: {
            colors: true,
            sizes: { include: { size: true } }
          }
        }
      },
    });
  } catch (error) {
    console.error("[DB] Error fetching cart:", error);
    throw new Error("Database error while fetching cart.");
  }
};

export const addToCart = async (userId, item) => {
  return await prisma.cartItem.upsert({
    where: {
      userId_productId_selectedSize_selectedColor: {
        userId,
        productId: item.productId,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      },
    },
    create: { userId, ...item },
    update: { quantity: item.quantity },
  });
};

export const removeFromCart = async (userId, cartItemId) => {
  try {
    return await prisma.cartItem.delete({
      where: {
        id: cartItemId,    // ✅ Use cartItem ID (primary key)
        userId: userId     // ✅ Ensure user owns this cart item
      }
    });
  } catch (error) {
    console.error("[DB] Delete error details:", error);
    throw error; // Propagate error to controller
  }
};

export const clearCart = async (userId) => {
  return await prisma.cart.deleteMany({
    where: { userId },
  });
};

export const updateCartQuantity = async (userId, productId, quantity) => {
  return await prisma.cart.updateMany({
    where: { userId, productId },
    data: { quantity },
  });
};

export default { getCartByUser, addToCart, removeFromCart, clearCart, updateCartQuantity };
