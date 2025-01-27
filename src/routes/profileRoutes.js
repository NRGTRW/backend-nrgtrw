import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  saveProfilePicture
} from "../controllers/profileController.js";
import { upload, handleMulterErrors } from "../utils/uploadConfig.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Enhanced routes with proper middleware sequencing
router.post(
  "/profile/upload",
  authMiddleware,        // Authentication first
  upload.single("profilePicture"), // File handling second
  handleMulterErrors,    // Handle upload errors third
  uploadProfilePicture   // Main logic last
);

router.put("/profile/save", 
  authMiddleware,
  (req, res, next) => { // Add validation middleware
    if (!req.body.profilePicture) {
      return res.status(400).json({ error: "Missing profile picture URL" });
    }
    next();
  },
  saveProfilePicture
);

// Existing routes remain unchanged
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

export default router;