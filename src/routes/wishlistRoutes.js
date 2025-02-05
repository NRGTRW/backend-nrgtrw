import express from "express";
import {
  getWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
} from "../controllers/wishlistController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Note: Call authMiddleware() to get the middleware function
router.get("/", authMiddleware(), getWishlist);
router.post("/", authMiddleware(), addItemToWishlist);
router.delete("/:wishlistId", authMiddleware(), removeItemFromWishlist);

export default router;
