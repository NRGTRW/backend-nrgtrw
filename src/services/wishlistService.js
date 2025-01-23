import prisma from "../../prisma/lib/prisma.js";

const getWishlistByUser = async (userId) => {
  return await prisma.wishlist.findMany({
    where: { userId },
    include: { product: true },
  });
};

const addToWishlist = async (userId, item) => {
  return await prisma.wishlist.upsert({
    where: {
      userId_productId: { userId, productId: item.productId }, // Unique constraint composite key
    },
    create: { userId, ...item },
    update: { ...item },
  });
};

const moveToWishlist = async (userId, item) => {
  // First remove from cart
  await prisma.cart.deleteMany({
    where: { userId, productId: item.productId },
  });
  // Then add to wishlist
  return await addToWishlist(userId, item);
};

const removeFromWishlist = async (userId, { productId, selectedSize, selectedColor }) => {
  return await prisma.wishlist.deleteMany({
    where: {
      userId,
      productId,
      selectedSize,
      selectedColor,
    },
  });
};

export default { getWishlistByUser, addToWishlist, moveToWishlist, removeFromWishlist };
