import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    console.log("📌 Received Token in Backend:", token); // Debugging

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    req.user = user; // ✅ Attach user object to request
    next();
  } catch (error) {
    console.error("🚨 Authentication failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

/**
 * ✅ Protect Middleware: Ensures User is Verified Before Proceeding
 */
export const protect = async (req, res, next) => {
  try {
    await authMiddleware(req, res, async () => {
      if (!req.user.isVerified) {
        return res.status(403).json({ error: "Account not verified. Please complete OTP verification." });
      }
      next();
    });
  } catch (error) {
    console.error("🚨 Protect Middleware Error:", error.message);
    return res.status(401).json({ error: "Unauthorized access." });
  }
};

export default authMiddleware;
