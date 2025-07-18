import express from "express";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  updateUserRole,
  getUsers,
  deleteUser
} from "../controllers/profileController.js";
import {
  getAnalytics,
  getOrders,
  getActivityLog,
  getSystemHealth
} from "../controllers/adminController.js";

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

// GET /api/admin/analytics – Връща аналитични данни
router.get(
  "/admin/analytics",
  authenticate,
  requireAdmin,
  getAnalytics
);

// GET /api/admin/orders – Връща списък с поръчки
router.get(
  "/admin/orders",
  authenticate,
  requireAdmin,
  getOrders
);

// GET /api/admin/activity-log – Връща лог с активности
router.get(
  "/admin/activity-log",
  authenticate,
  requireAdmin,
  getActivityLog
);

// GET /api/health – Връща здравето на системата
router.get("/health", getSystemHealth);

export default router;
