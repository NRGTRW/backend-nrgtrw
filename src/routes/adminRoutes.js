import express from "express";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";
import { updateUserRole, getUsers } from "../controllers/profileController.js";
import { deleteProduct } from "../controllers/productController.js";

const router = express.Router();

// Role Management (Root Admin only)
router.put("/users/role", authMiddleware(["ROOT_ADMIN"]), adminMiddleware(), updateUserRole);

// Get users (Admin + Root Admin)
router.get("/admin/users", authMiddleware(["ADMIN", "ROOT_ADMIN"]), adminMiddleware(), getUsers);

// Delete product (Admin + Root Admin)
router.delete("/products/:id", authMiddleware(["ADMIN", "ROOT_ADMIN"]), adminMiddleware(), deleteProduct);

export default router;
