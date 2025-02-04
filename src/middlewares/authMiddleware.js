import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * ✅ Authentication Middleware
 * - Verifies JWT token and fetches user details from DB.
 * - Optionally checks if the user has a required role.
 */
export const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized. No token provided." });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Fetch fresh user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true, profilePicture: true },
      });
      if (!user) {
        return res.status(401).json({ error: "User not found." });
      }
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ error: `Forbidden. Required roles: [${roles.join(', ')}]` });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("🔴 Middleware Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};


/**
 * ✅ Protect Middleware
 * - Verifies JWT token and adds user info to `req.user`.
 */
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ Contains { id: userId }
    console.log("🔓 Authenticated User ID:", req.user.id);
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

/**
 * ✅ Admin Middleware
 * - Ensures the user is an admin or root admin.
 */
export const adminMiddleware = async (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "root_admin")) {
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }
  next();
};

/**
 * ✅ Root Admin Middleware
 * - Ensures **only** the root admin can perform the action.
 */
export const rootAdminMiddleware = async (req, res, next) => {
  if (req.user.role !== "root_admin") {
    return res.status(403).json({ error: "Forbidden. Only the root admin can perform this action." });
  }
  next();
};
