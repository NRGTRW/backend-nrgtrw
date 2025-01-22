import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  saveProfilePicture,
} from "../controllers/profileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile); // Fetch user profile
router.put("/profile", authMiddleware, updateProfile); // Update profile
router.post("/profile/upload", authMiddleware, uploadProfilePicture); // Upload profile picture
router.put("/profile/save", authMiddleware, saveProfilePicture); // Save profile picture path

export default router;
