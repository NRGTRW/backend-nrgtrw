import express from "express";
import { getProducts, getProductById } from "../controllers/productController.js";

const router = express.Router();

// Route for fetching all products
router.get("/", getProducts);

// Route for fetching a single product by ID
router.get("/:id", getProductById);

export default router;
