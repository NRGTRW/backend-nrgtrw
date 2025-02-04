import { PrismaClient } from "@prisma/client";
import { decrypt, encrypt } from "../utils/cryptoUtils.js";
import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Configure AWS S3 Client (v3)
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION || 'eu-central-1',
});

// Multer Configuration for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      console.error("Rejected file type:", file.mimetype);
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Multer error handling middleware
const handleMulterErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error("Multer error:", error.message);
    return res.status(400).json({ error: error.message });
  } else if (error) {
    console.error("File upload error:", error.message);
    return res.status(400).json({ error: error.message });
  }
  next();
};

// Get Profile Handler
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address ? decrypt(user.address) : null,
      phone: user.phone ? decrypt(user.phone) : null,
      profilePicture: user.profilePicture || null,
    });
  } catch (error) {
    console.error("Failed to load profile:", error.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
};

// Update Profile Handler
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, phone, profilePicture } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        address: address ? encrypt(address) : undefined,
        phone: phone ? encrypt(phone) : undefined,
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

// Upload Profile Picture to S3 (AWS SDK v3)
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");
    if (!process.env.AWS_S3_BUCKET_NAME) throw new Error("S3 bucket not configured");

    const fileKey = `ProfilePictures/${Date.now()}-${uuidv4()}-${req.file.originalname}`;
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    
    const publicUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    
    res.json({ previewPath: publicUrl });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message
    });
  }
};

// Save Profile Picture Handler
export const saveProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const userId = req.user.id;

    if (!profilePicture) {
      return res.status(400).json({ error: "No profile picture provided" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete old image if exists
    if (user.profilePicture) {
      try {
        const oldUrl = new URL(user.profilePicture);
        const oldKey = oldUrl.pathname.substring(1);
        
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: oldKey
        }));
      } catch (deleteError) {
        console.error('Old image deletion error:', deleteError);
      }
    }

    // Update database with new URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture },
      select: { id: true, profilePicture: true }
    });

    res.status(200).json({
      message: "Profile picture saved successfully",
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    console.error('Save Profile Picture Error:', error);
    res.status(500).json({ 
      error: "Failed to save profile picture",
      details: error.message 
    });
  }
};

// =======================
// Admin Functions
// =======================

// Fetch all users (Admin-only)
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profilePicture: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    });
  }
};

// Update a user's role (Admin-only)
export const updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    if (!['admin', 'user'].includes(newRole)) {
      return res.status(400).json({
        success: false,
        error: "Invalid role specified"
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json({
      success: true,
      message: `Role updated to ${newRole}`,
      data: updatedUser
    });
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({
      success: false,
      error: "Role update failed"
    });
  }
};

export { upload, handleMulterErrors };
