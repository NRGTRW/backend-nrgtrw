import express from "express";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";
import { updateUserRole, getUsers, deleteUser } from "../controllers/profileController.js";

const router = express.Router();

// Role Management (Root Admin only)
router.put("/admin/users/role", authAndAdminMiddleware(["ROOT_ADMIN"]), updateUserRole);
  
// Get users (Admin + Root Admin)
router.get("/admin/users", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), getUsers);

// Delete product (Admin + Root Admin)
router.delete("/admin/users/:id", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), deleteUser);
  
export default router;
