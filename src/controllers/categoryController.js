import prisma from "../utils/prisma.js";

// Fetch all categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// Create a new category
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
    });

    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    next(error);
  }
};

// Fetch a category by slug
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: { products: true }, // Include related products
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};
