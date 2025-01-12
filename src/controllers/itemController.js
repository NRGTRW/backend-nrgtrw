// controllers/itemController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getItems = async (req, res) => {
  try {
    // Fetch items with related data (sizes and colors)
    const items = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        price: true,
        description: true,
        category: true, // Include category field
        colors: {
          select: {
            id: true,
            colorName: true,
            imageUrl: true,
            hoverImage: true,
          },
        },
        sizes: {
          select: {
            id: true,
            size: true,
          },
        },
      },
    });

    // Log the number of items fetched
    console.log(`Fetched ${items.length} items from the database.`);

    // Respond with the items
    res.status(200).json(items);
  } catch (error) {
    // Log the error in detail
    console.error("Error fetching items:", error.message);
    res.status(500).json({
      error: "Failed to fetch items",
      details: error.message,
    });
  }
};
