import express from "express";
import {
  getAllProducts,
  getProductById
} from "../controllers/productController.js";

const router = express.Router();

// Route for fetching all products
router.get("/", getAllProducts);

// Route for fetching a single product by ID
router.get("/:id", getProductById);

export default router;
