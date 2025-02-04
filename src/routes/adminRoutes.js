import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { updateUserRole, getUsers } from "../controllers/userController.js";
import { deleteProduct } from "../controllers/productController.js";

const router = express.Router();

// Role Management (Root Admin only)
router.put("/users/role", authMiddleware(["root_admin"]), updateUserRole);

// Get users (Admin + Root Admin)
router.get("/admin/users", authMiddleware(["admin", "root_admin"]), getUsers);

// Delete product (Admin + Root Admin)
router.delete("/products/:id", authMiddleware(["admin", "root_admin"]), deleteProduct);

export default router;
