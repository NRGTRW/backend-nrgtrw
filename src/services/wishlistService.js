import prisma from "../../prisma/lib/prisma.js";

// Fetch the wishlist for a given user (including product details)
export const getWishlistByUser = async (userId) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            imageUrl: true,
            colors: true,
            productsize: { include: { size: true } },
          },
        },
      },
    });

    console.log("🔍 Wishlist from DB:", wishlist);
    return wishlist;
  } catch (error) {
    console.error("[DB] Error fetching wishlist:", error);
    throw new Error("Database error while fetching wishlist.");
  }
};

export const addToWishlist = async (userId, item) => {
  try {
    console.log("📩 Adding to Wishlist:", item);

    return await prisma.wishlist.upsert({
      where: {
        userId_productId_selectedSize_selectedColor: {
          userId,
          productId: item.productId,
          selectedSize: item.selectedSize || "",
          selectedColor: item.selectedColor || "",
        },
      },
      create: {
        userId,
        productId: item.productId,
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || "",
        quantity: item.quantity || 1,
      },
      update: {
        quantity: item.quantity || 1,
      },
    });
  } catch (error) {
    console.error("🚨 Prisma Wishlist Error:", error);
    throw new Error("Failed to add item to wishlist.");
  }
};

// (Optional) If you need to move items from the cart to the wishlist:
export const moveToWishlist = async (userId, item) => {
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

export const removeFromWishlist = async (userId, wishlistId) => {
  try {
    console.log("🛠️ Removing Wishlist Item:", { userId, wishlistId });

    // Using deleteMany ensures that we check both id and userId.
    const result = await prisma.wishlist.deleteMany({
      where: {
        id: Number(wishlistId),
        userId: Number(userId),
      },
    });

    if (result.count === 0) {
      throw new Error("Wishlist item not found or unauthorized deletion.");
    }

    console.log("✅ Item removed from wishlist:", result);
    return result;
  } catch (error) {
    console.error("❌ Failed to remove from wishlist:", error);
    throw new Error("Could not remove item from wishlist.");
  }
};

export default { getWishlistByUser, addToWishlist, moveToWishlist, removeFromWishlist };
