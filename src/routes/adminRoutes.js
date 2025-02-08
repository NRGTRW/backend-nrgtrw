import express from "express";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";
import {
  updateUserRole,
  getUsers,
  deleteUser
} from "../controllers/profileController.js";

const router = express.Router();

// PUT /api/admin/users/role – Променя ролята на потребител (само ROOT_ADMIN)
router.put(
  "/admin/users/role",
  authAndAdminMiddleware(["ROOT_ADMIN"]),
  updateUserRole
);

// GET /api/admin/users – Връща списък с всички потребители (само за ROOT_ADMIN и ADMIN)
router.get(
  "/admin/users",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  getUsers
);

// DELETE /api/admin/users/:id – Изтрива потребител (само ROOT_ADMIN)
router.delete(
  "/admin/users/:id",
  authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]),
  deleteUser
);

export default router;
