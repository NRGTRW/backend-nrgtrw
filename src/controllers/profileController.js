import { PrismaClient } from "@prisma/client";
import { decrypt, encrypt } from "../utils/cryptoUtils.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address ? decrypt(user.address) : null,
      phone: user.phone ? decrypt(user.phone) : null,
      profilePicture: user.profilePicture, // Ensure this is included
    });
  } catch (error) {
    console.error("Failed to load profile:", error.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
};



export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, phone, profilePicture } = req.body;

    const encryptedAddress = address ? encrypt(address) : null;
    const encryptedPhone = phone ? encrypt(phone) : null;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        address: encryptedAddress,
        phone: encryptedPhone,
        profilePicture,
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Configure Multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../uploads")); // Ensure `uploads/` exists
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Upload profile picture handler
export const uploadProfilePicture = [
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const previewPath = `/uploads/${req.file.filename}`;

      res.status(200).json({
        message: "File uploaded successfully",
        previewPath,
      });
    } catch (error) {
      console.error("Error uploading file:", error.message);
      res.status(500).json({ error: "Failed to upload profile picture" });
    }
  },
];

export const saveProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body; // Path to the image
    const userId = req.user.id; // User ID from auth middleware

    if (!profilePicture) {
      return res.status(400).json({ error: "No profile picture provided" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture },
    });

    res.status(200).json({ 
      message: "Profile picture saved successfully", 
      profilePicture: updatedUser.profilePicture 
    });
  } catch (error) {
    console.error("Error saving profile picture:", error.message);
    res.status(500).json({ error: "Failed to save profile picture" });
  }
};

