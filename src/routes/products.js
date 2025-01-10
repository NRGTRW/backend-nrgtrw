import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

export default router;
