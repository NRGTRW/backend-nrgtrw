import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authAndAdminMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Unauthorized. No token provided." });
      }

      const token = authHeader.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          profilePicture: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: "User not found." });
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        return res
          .status(403)
          .json({ error: `Forbidden. Required roles: [${roles.join(", ")}]` });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("🔴 JWT Verification Error:", error);
      return res
        .status(401)
        .json({ error: "Invalid or expired token. Please log in again." });
    }
  };
};

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("🔓 Authenticated User ID:", req.user.id);
    next();
  } catch (error) {
    console.error(
      `❌ Token verification failed for ${req.method} ${req.originalUrl}:`,
      error.message
    );
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};
