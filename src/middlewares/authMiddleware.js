import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from the database
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    console.error("Authentication failed:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default authMiddleware;
