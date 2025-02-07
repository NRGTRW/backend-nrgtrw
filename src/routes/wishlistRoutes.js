import express from "express";
import {
  getWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
} from "../controllers/wishlistController.js";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Note: Call authMiddleware() to get the middleware function
router.get("/", authAndAdminMiddleware(), getWishlist);
router.post("/", authAndAdminMiddleware(), addItemToWishlist);
router.delete("/:wishlistId", authAndAdminMiddleware(), removeItemFromWishlist);

export default router;
