import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById); // Added route to fetch a product by ID
router.post("/", createProduct);

export default router;
