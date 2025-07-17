import express from "express";
import {
  removeFromCart,
  getCart,
  addToCart
} from "../controllers/cartController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/wishlist – Връща продуктите в желания списък на потребител
router.get("/", authenticate, getCart);

// POST /api/wishlist – Добавя продукт в желания списък
router.post("/", authenticate, addToCart);

// DELETE /api/wishlist/:productId – Премахва продукт от желания списък
router.delete("/:cartItemId", authenticate, removeFromCart);

export default router;
