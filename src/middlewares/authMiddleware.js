import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Middleware: Received token:", token);
  if (!token) return res.status(401).json({ error: "Token missing" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Middleware: Decoded token:", decoded);
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!req.user) return res.status(401).json({ error: "User not found" });
    next();
  } catch (error) {
    console.error("Middleware: Authentication error:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
