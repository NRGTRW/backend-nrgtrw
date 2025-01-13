import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getProfile);
router.put("/", updateProfile);

export default router;