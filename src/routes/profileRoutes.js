import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { updateProfile } from "../controllers/profileController.js";

const router = express.Router();

// Protect the profile route with the auth middleware
router.get("/profile", authMiddleware, (req, res) => {
    console.log("Route hit: /api/profile");
    if (req.user) {
      console.log("User data:", req.user);
      res.json(req.user);
    } else {
      console.log("No user data");
      res.status(404).json({ error: "User not found" });
    }
  });
  
  router.put("/profile", authMiddleware,updateProfile);

export default router;
