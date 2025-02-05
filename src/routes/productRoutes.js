import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/uploadConfig.js";

const router = express.Router();

// ✅ Public Routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// ✅ Protected Routes (Admin Only) - Supports File Upload
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 10), createProduct);

// ✅ Delete Product (Admin Only)
router.delete("/products/:id", authMiddleware(["ADMIN", "ROOT_ADMIN"]), adminMiddleware(), deleteProduct);

export default router;
