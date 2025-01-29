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
      userId_productId_selectedSize_selectedColor: {
        userId,
        productId: item.productId,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
      },
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
      productId: parseInt(productId, 10),
      selectedSize: selectedSize || null,
      selectedColor: selectedColor || null,
    },
  });
};

export default { getWishlistByUser, addToWishlist, moveToWishlist, removeFromWishlist };
