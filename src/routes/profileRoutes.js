import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  saveProfilePicture,
} from "../controllers/profileController.js";
import { upload, handleMulterErrors } from "../utils/uploadConfig.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/profile/upload – Upload a new profile picture
router.post(
  "/upload",
  authMiddleware(), // Call the factory function to get the middleware
  upload.single("profilePicture"),
  handleMulterErrors,
  uploadProfilePicture
);

// PUT /api/profile/save – Save the profile picture URL in DB
router.put(
  "/save",
  authMiddleware(),
  (req, res, next) => {
    if (!req.body.profilePicture) {
      return res.status(400).json({ error: "Missing profile picture URL" });
    }
    next();
  },
  saveProfilePicture
);

// GET /api/profile – Get profile information
router.get("/", authMiddleware(), getProfile);

// PUT /api/profile – Update profile information
router.put("/", authMiddleware(), updateProfile);

export default router;
