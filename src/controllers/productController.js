import { PrismaClient } from "@prisma/client";
import { uploadProfilePicture } from "../utils/uploadConfig.js";

const prisma = new PrismaClient();

export const getAllProducts = async (req, res) => {
  try {
    console.log("Fetching products from the database..."); 
    const products = await prisma.product.findMany({
      include: {
        productsize: { include: { size: true } }, // ✅ Correct relation name
        colors: true, // ✅ Ensure this matches the schema
      },
    });
    

    console.log("✅ Products fetched:", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        productsize: { include: { size: true } },
        colors: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" }); // ✅ Return prevents further execution
    }

    // ✅ Transform sizes so frontend gets a clean response
    const formattedProduct = {
      ...product,
      sizes: product.productsize.map((ps) => ps.size), // Extract sizes directly
    };

    return res.status(200).json(formattedProduct); // ✅ Always return here
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error.message);
    if (!res.headersSent) { // ✅ Prevents sending multiple responses
      return res.status(500).json({ error: "Failed to fetch product." });
    }
  }
};

