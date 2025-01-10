import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const prisma = new PrismaClient();
const router = express.Router();

// Get Profile
router.get("/", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json(user);
});

// Update Profile
router.put("/", authMiddleware, async (req, res) => {
  const { name, address, phone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name, address, phone }
  });
  res.json(user);
});

export default router;
