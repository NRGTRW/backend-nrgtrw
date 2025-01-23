import prisma from "../../prisma/lib/prisma.js";

export const getCartByUser = async (userId) => {
  return await prisma.cart.findMany({
    where: { userId },
    include: { product: true },
  });
};

export const addToCart = async (userId, item) => {
  return await prisma.cart.upsert({
    where: {
      userId_productId: { userId, productId: item.productId }, // Composite unique constraint
    },
    create: { userId, ...item },
    update: { ...item, quantity: item.quantity }, // Update if already exists
  });
};

export const removeFromCart = async (userId, productId) => {
  return await prisma.cart.deleteMany({
    where: { userId, productId },
  });
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
