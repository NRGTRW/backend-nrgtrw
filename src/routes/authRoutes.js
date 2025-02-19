import express from "express";
import { signup, login } from "../controllers/authController.js";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/profileController.js";
import {
  resetPassword,
  updatePassword,
  verifyOTP
} from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/signup – Регистрация на нов потребител
router.post("/signup", signup);

// POST /api/auth/login – Вход в системата
router.post("/login", login);

//GET /api/auth/profile - Взимаме данните за профила
router.get("/profile", authAndAdminMiddleware, getProfile);

//POST  /api/auth/reset-password - Изпращаме мейл за възтановяване на парола
router.post("/reset-password", resetPassword);

// POST /api/auth/update-password - Промяна на паролата
router.post("/update-password", updatePassword);

// POST /api/auth/verify-otp - 2FA
router.post("/verify-otp", verifyOTP);

export default router;
