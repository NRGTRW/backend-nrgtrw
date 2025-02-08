import express from "express";
import {
  removeFromCart,
  getCart,
  addToCart
} from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/wishlist – Връща продуктите в желания списък на потребител
router.get("/", protect, getCart);

// POST /api/wishlist – Добавя продукт в желания списък
router.post("/", protect, addToCart);

// DELETE /api/wishlist/:productId – Премахва продукт от желания списък
router.delete("/:cartItemId", protect, removeFromCart);

export default router;
