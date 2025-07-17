import express from "express";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  updateUserRole,
  getUsers,
  deleteUser
} from "../controllers/profileController.js";

const router = express.Router();

// PUT /api/admin/users/role – Променя ролята на потребител (само ROOT_ADMIN)
router.put(
  "/admin/users/role",
  authenticate,
  requireAdmin,
  updateUserRole
);

// GET /api/admin/users – Връща списък с всички потребители (само за ROOT_ADMIN и ADMIN)
router.get(
  "/admin/users",
  authenticate,
  requireAdmin,
  getUsers
);

// DELETE /api/admin/users/:id – Изтрива потребител (само ROOT_ADMIN)
router.delete(
  "/admin/users/:id",
  authenticate,
  requireAdmin,
  deleteUser
);

export default router;
