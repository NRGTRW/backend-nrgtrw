import express from "express";
import {
  getWishlist,
  addItemToWishlist,
  removeItemFromWishlist
} from "../controllers/wishlistController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/wishlist – Връща продуктите в желания списък на потребителя
router.get("/", authenticate, getWishlist);

// POST /api/wishlist – Добавя продукт в желания списък
router.post("/", authenticate, addItemToWishlist);

// DELETE /api/wishlist/:productId – Премахва продукт от желания списък
router.delete("/:wishlistId", authenticate, removeItemFromWishlist);

export default router;
