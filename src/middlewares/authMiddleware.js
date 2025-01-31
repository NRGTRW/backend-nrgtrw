import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

 const authMiddleware = async (req, res, next) => {
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
 const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) throw new Error("User not found");
    req.user = user; // ✅ Attach user to request
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

export { authMiddleware, protect };
