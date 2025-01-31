import express from "express";
import { removeFromCart, getCart, addToCart } from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/:cartItemId", protect, removeFromCart); // Add this line

export default router;
