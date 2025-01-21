import prisma from "../../prisma/lib/prisma.js";

const getWishlistByUser = async (userId) => {
  return await prisma.wishlist.findMany({
    where: { userId },
    include: { product: true },
  });
};

const addToWishlist = async (userId, item) => {
  const existingItem = await prisma.wishlist.findFirst({
    where: {
      userId,
      productId: item.productId,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    },
  });

  if (existingItem) {
    throw new Error("Item already exists in wishlist.");
  }

  return await prisma.wishlist.create({
    data: {
      userId,
      productId: item.productId,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      quantity: item.quantity || 1,
    },
  });
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

export default { getWishlistByUser, addToWishlist, removeFromWishlist };
