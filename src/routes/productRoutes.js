import express from "express";
import {
  getAllProducts,
  getProductById
} from "../controllers/productController.js";

const router = express.Router();

// GET /products (fetch all products)
router.get("/", getAllProducts);

// GET /products/:id (fetch single product by ID)
router.get("/:id", getProductById);

export default router;
