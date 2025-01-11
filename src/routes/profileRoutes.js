import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture
} from "../controllers/profileController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/", authenticateToken, getProfile);
router.put("/", authenticateToken, updateProfile);
router.post(
  "/upload",
  authenticateToken,
  upload.single("profilePicture"),
  uploadProfilePicture
);

export default router;
