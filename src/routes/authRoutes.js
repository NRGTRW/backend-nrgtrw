import express from "express";
import { signup, login } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/profileController.js";
import {
  resetPassword,
  updatePassword,
  verifyOTP
} from "../controllers/authController.js";
import { checkIPBan, abuseLimiter } from '../middlewares/abuseProtection.js';
import passport from '../utils/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// POST /api/auth/signup – Регистрация на нов потребител
router.post("/signup", checkIPBan, abuseLimiter, signup);

// POST /api/auth/login – Вход в системата
router.post("/login", login);

//GET /api/auth/profile - Взимаме данните за профила
router.get("/profile", authenticate, getProfile);

//POST  /api/auth/reset-password - Изпращаме мейл за възтановяване на парола
router.post("/reset-password", checkIPBan, abuseLimiter, resetPassword);

// POST /api/auth/update-password - Промяна на паролата
router.post("/update-password", updatePassword);

// POST /api/auth/verify-otp - 2FA
router.post("/verify-otp", verifyOTP);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), (req, res) => {
  // Issue JWT and redirect to frontend with token
  const token = jwt.sign({ id: req.user.id, role: req.user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  // Split CLIENT_URL and match origin, or use the first
  const clientUrls = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
  let redirectUrl = clientUrls[0]?.trim() || 'http://localhost:5173';
  if (req.headers.origin && clientUrls.map(u => u.trim()).includes(req.headers.origin)) {
    redirectUrl = req.headers.origin;
  }
  res.redirect(`${redirectUrl}/profile?token=${token}`);
});

export default router;
