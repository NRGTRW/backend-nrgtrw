import express from "express";
import { getProfile, updateProfile, uploadProfilePicture } from "../controllers/profileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.post("/upload", authMiddleware, upload.single("profilePicture"), uploadProfilePicture);

export default router;
