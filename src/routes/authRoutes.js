import express from "express";
import { signup, login } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfile } from "../controllers/profileController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

export default router;

