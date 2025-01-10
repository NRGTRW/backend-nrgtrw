import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

// Add to Cart
router.post("/", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const cartItem = await prisma.cart.create({
    data: {
      userId: req.userId,
      productId,
      quantity
    }
  });
  res.json(cartItem);
});

export default router;
