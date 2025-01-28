import express from "express";
import { signup, login } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/profileController.js";
import { resetPassword, updatePassword, verifyOTP } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
// Password reset routes
router.post("/reset-password", resetPassword);
router.post("/update-password", updatePassword);

router.post("/verify-otp", verifyOTP);


export default router;

