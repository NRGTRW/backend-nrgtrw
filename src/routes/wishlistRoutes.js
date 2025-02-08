import express from "express";
import {
  getWishlist,
  addItemToWishlist,
  removeItemFromWishlist
} from "../controllers/wishlistController.js";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/wishlist – Връща продуктите в желания списък на потребителя
router.get("/", authAndAdminMiddleware(), getWishlist);

// POST /api/wishlist – Добавя продукт в желания списък
router.post("/", authAndAdminMiddleware(), addItemToWishlist);

// DELETE /api/wishlist/:productId – Премахва продукт от желания списък
router.delete("/:wishlistId", authAndAdminMiddleware(), removeItemFromWishlist);

export default router;
