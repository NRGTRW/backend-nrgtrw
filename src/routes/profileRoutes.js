const express = require("express");
const { updateProfile, getProfile } = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Apply authentication middleware to all profile routes
router.use(authMiddleware);

// Profile Routes
router.get("/", getProfile); // Get user profile
router.put("/", updateProfile); // Update user profile

module.exports = router;
