import express from "express";
import {
  getCategories,
  createCategory,
  getCategoryBySlug,
} from "../controllers/categoryController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { authorizeRole } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Get all categories
router.get("/", getCategories);

// Create a new category (Admin only)
router.post("/", authenticateToken, authorizeRole("admin"), createCategory);

// Get a single category by slug
router.get("/:slug", getCategoryBySlug);

export default router;
