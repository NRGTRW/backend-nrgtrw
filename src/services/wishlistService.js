import prisma from "../../prisma/lib/prisma.js";

const getWishlistByUser = async (userId) => {
  return await prisma.wishlist.findMany({
    where: { userId },
    include: { 
      product: {
        select: { name: true, price: true, imageUrl: true } // ✅ Ensure necessary product details are included
      }
    },
  });
};

const addToWishlist = async (userId, item) => {
  try {
    console.log("📩 Adding to Wishlist:", item);

    return await prisma.wishlist.upsert({
      where: {
        userId_productId_selectedSize_selectedColor: {
          userId,
          productId: item.productId,
          selectedSize: item.selectedSize || "", // ✅ Use empty string instead of null
          selectedColor: item.selectedColor || "",
        },
      },
      create: {
        userId,
        productId: item.productId,
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || "",
        quantity: item.quantity,
      },
      update: {
        quantity: item.quantity,
      },
    });
  } catch (error) {
    console.error("🚨 Prisma Wishlist Error:", error);
    throw new Error("Failed to add item to wishlist.");
  }
};

const moveToWishlist = async (userId, item) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId, productId: item.productId },
    });

    return await addToWishlist(userId, item);
  } catch (error) {
    console.error("🚨 Move to Wishlist Error:", error);
    throw new Error("Failed to move item to wishlist.");
  }
};

const removeFromWishlist = async (userId, wishlistId) => {
  try {
    console.log("🛠️ Removing Wishlist Item:", { userId, wishlistId });

    const result = await prisma.wishlist.delete({
      where: {
        id: Number(wishlistId), // ✅ Ensure correct ID targeting
        userId: Number(userId), // ✅ Prevent unauthorized deletions
      },
    });

    console.log("✅ Item removed from wishlist:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to remove from wishlist:", error);
    throw new Error("Could not remove item from wishlist.");
  }
};

export default { getWishlistByUser, addToWishlist, moveToWishlist, removeFromWishlist };
