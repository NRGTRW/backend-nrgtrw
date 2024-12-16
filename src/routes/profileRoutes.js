import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, getProfile);

// Update the user's profile
router.put("/", authenticateToken, updateProfile);

export default router;
