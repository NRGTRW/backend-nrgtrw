import express from "express";
import { upload, uploadProfilePicture } from "../utils/uploadConfig.js";

const router = express.Router();

// Качване на множество снимки и връщане на S3 URL-ите им
router.post("/", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        return await uploadProfilePicture(file, "DifferentColors");
      })
    );

    res
      .status(200)
      .json({ message: "Upload successful", images: uploadedImages });
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    res
      .status(500)
      .json({ error: "Failed to upload images", details: error.message });
  }
});

export default router;
