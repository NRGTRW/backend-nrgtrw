import express from "express";
import { login, signup } from "../controllers/authController.js";

const router = express.Router();

// User authentication routes
router.post("/signup", signup);
router.post("/login", login);

export default router;