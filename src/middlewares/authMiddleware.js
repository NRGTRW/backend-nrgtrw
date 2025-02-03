import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();


const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      // 1. Extract and verify token
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized. No token provided." });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. Fetch fresh user data
      await prisma.$queryRaw`SELECT 1`;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          role: true, 
          profilePicture: true 
        },
      });

      if (!user) {
        return res.status(401).json({ error: "User not found." });
      }

      // Role validation
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ 
          error: `Required roles: [${roles.join(', ')}]` 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Middleware Error:", error);
      if (error instanceof PrismaClientKnownRequestError){
                return res.status(503).json({ error: "Database error" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  };
};

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

/**
 * ✅ Admin Middleware
 * Ensures the user is an admin or root admin.
 */
const adminMiddleware = async (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "root_admin")) {
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }
  next();
};

/**
 * ✅ Root Admin Middleware
 * Ensures **only** the root admin can perform the action.
 */
const rootAdminMiddleware = async (req, res, next) => {
  if (req.user.role !== "root_admin") {
    return res.status(403).json({ error: "Only the root admin can perform this action." });
  }
  next();
};

export { authMiddleware, protect, adminMiddleware, rootAdminMiddleware };
