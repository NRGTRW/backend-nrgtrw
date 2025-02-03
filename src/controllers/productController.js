import { PrismaClient } from "@prisma/client";
import { uploadProfilePicture } from "../utils/uploadConfig.js";

const prisma = new PrismaClient();

export const getAllProducts = async (req, res) => {
  try {
    console.log("Fetching products from the database..."); 
    const products = await prisma.product.findMany({
      include: {
        sizes: {
          include: { size: true }, // ✅ Ensure each size is returned
        },
        colors: true, // ✅ Include color data
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
        sizes: {
          include: { size: true }, // ✅ Include size details
        },
        colors: true, // ✅ Include color options
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(`❌ Error fetching product with ID ${id}:`, error.message);
    res.status(500).json({ error: "Failed to fetch product." });
  }
};

/**
 * ✅ Create a New Product (Admin Only)
 */

export const createProduct = async (req, res) => {
  try {
    console.log("📌 Received Request Body:", req.body);
    console.log("📌 Received Files:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one product image is required." });
    }

    // ✅ Convert `stock` and `categoryId` to integers
    const stock = parseInt(req.body.stock, 10);
    const categoryId = req.body.categoryId ? parseInt(req.body.categoryId, 10) : null;

    if (isNaN(stock)) {
      return res.status(400).json({ error: "Stock must be a valid integer." });
    }

    // ✅ Ensure `colors` is an array
    let colors = req.body.colors;
    if (typeof colors === "string") {
      try {
        colors = JSON.parse(colors); // Convert string to JSON array
      } catch (error) {
        return res.status(400).json({ error: "Invalid colors format. Must be an array." });
      }
    }

    if (!Array.isArray(colors)) {
      return res.status(400).json({ error: "Colors must be an array." });
    }

    // ✅ Upload images to S3
    const uploadedImages = await Promise.all(
      req.files.map(file => uploadProfilePicture(file, "DifferentColors"))
    );

    console.log("✅ Uploaded Images:", uploadedImages);

    // ✅ Assign images to colors properly
    colors = colors.map((color, index) => ({
      colorName: color.colorName,
      imageUrl: uploadedImages[index] || "",  // Assign uploaded image URL
      hoverImage: uploadedImages[index + colors.length] || "", // Assign hover image if available
    }));

    // ✅ Ensure `sizes` is an array
    let sizes = req.body.sizes;
    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes);
      } catch (error) {
        return res.status(400).json({ error: "Invalid sizes format. Must be an array." });
      }
    }

    if (!Array.isArray(sizes)) {
      return res.status(400).json({ error: "Sizes must be an array." });
    }

    // ✅ Create the product
    const newProduct = await prisma.product.create({
      data: {
        name: req.body.name,
        price: parseFloat(req.body.price),
        description: req.body.description,
        stock: stock,
        categoryId: categoryId,
        imageUrl: uploadedImages[0], // Assign main image
        sizes: { create: sizes.map(size => ({ sizeId: size.sizeId })) },
        colors: { create: colors } // ✅ Ensure images are now attached
      },
      include: { sizes: true, colors: true }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ error: "Failed to create product.", details: error.message });
  }
};



  


/**
 * ✅ Delete Product (Admin Only)
 */
export const deleteProduct = async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "root_admin") {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: parseInt(id, 10) } });
    res.json({ message: "✅ Product deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product." });
  }
};
