import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllProducts = async (req, res) => {
  try {
    console.log("Fetching products from the database...");
    const products = await prisma.product.findMany({
      // Include the join table "sizes" AND nest the actual "size" record
      include: {
        sizes: {
          include: {
            size: true, // <--- This is what ensures each size is returned
          },
        },
        colors: true,
      },
    });

    console.log("Products fetched:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        sizes: {
          include: {
            size: true, // <--- Same here, to include nested size data
          },
        },
        colors: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message);
    res.status(500).json({ error: "Failed to fetch product." });
  }
};
