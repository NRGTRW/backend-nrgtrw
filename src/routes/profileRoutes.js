import express from "express";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  saveProfilePicture
} from "../controllers/profileController.js";
import { upload, handleMulterErrors } from "../utils/uploadConfig.js";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/profile/upload – Качване на нова профилна снимка
router.post(
  "/upload",
  authAndAdminMiddleware(),
  upload.single("profilePicture"),
  handleMulterErrors,
  uploadProfilePicture
);

// PUT /api/profile/save – Запазване на URL на профилната снимка в базата данни
router.put(
  "/save",
  authAndAdminMiddleware(),
  (req, res, next) => {
    if (!req.body.profilePicture) {
      return res.status(400).json({ error: "Липсва URL на профилната снимка" });
    }
    next();
  },
  saveProfilePicture
);

// GET /api/profile – Извличане на информация за профила
router.get("/", authAndAdminMiddleware(), getProfile);

// PUT /api/profile – Актуализиране на информацията в профила
router.put("/", authAndAdminMiddleware(), updateProfile);

export default router;
