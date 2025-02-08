// categoryRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/categories - Returns an array of category objects.
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;
