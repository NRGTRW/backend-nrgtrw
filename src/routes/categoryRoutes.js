import express from "express";
import {
  getCategories,
  createCategory,
  getCategoryBySlug,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", createCategory);
router.get("/:slug", getCategoryBySlug);

export default router;
