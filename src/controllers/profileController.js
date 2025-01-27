import { PrismaClient } from "@prisma/client";
import { decrypt, encrypt } from "../utils/cryptoUtils.js";
import AWS from "aws-sdk";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-central-1', // Hardcode your region
  signatureVersion: 'v4',
  correctClockSkew: true // Important for time sync
});

// Multer Configuration for in-memory file storage
const upload = multer({
  // Store files in memory for direct S3 uploads
  storage: multer.memoryStorage(),

  // Limit file size to 20MB
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB

  // File filter to allow only image files
  fileFilter: (req, file, cb) => {
    console.log("File received:", file.originalname, "Type:", file.mimetype);

    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // Accept the file
    } else {
      console.error("Rejected file type:", file.mimetype);
      cb(new Error("Only image files are allowed"), false); // Reject non-image files
    }
  },
});

// Middleware to handle errors from multer
const handleMulterErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // Handle Multer-specific errors
    console.error("Multer error:", error.message);
    return res.status(400).json({ error: error.message });
  } else if (error) {
    // Handle general errors (e.g., invalid file type)
    console.error("File upload error:", error.message);
    return res.status(400).json({ error: error.message });
  }
  next();
};

export { upload, handleMulterErrors };


// Get Profile Handler
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
      profilePicture: user.profilePicture || null,
      // profilePicture: user.profilePicture
      //   ? `${process.env.IMAGE_BASE_URL}/${user.profilePicture}`
      //   : "/default-profile.webp",
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

// Upload Profile Picture to S3
export const uploadProfilePicture = async (req, res) => {
  try {
    // Add validation for AWS configuration
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }

    // Debug log for file verification
    console.log('Received file metadata:', {
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `ProfilePictures/${Date.now()}-${uuidv4()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype 
    };

    // Add S3 region verification
    console.log('AWS Configuration Verification:', {
      accessKey: process.env.AWS_ACCESS_KEY_ID ? '*****' : 'MISSING',
      secretKey: process.env.AWS_SECRET_ACCESS_KEY ? '*****' : 'MISSING',
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: s3.config.region
    });

    const uploadResult = await s3.upload(params).promise(); // ✅ Correct variable
    res.json({ previewPath: uploadResult.Location }); // ✅ Returns valid S3 URL
  } catch (error) {
    console.error('Upload Error:', {
      message: error.message,
      stack: error.stack,
      s3Error: error.code,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      region: process.env.AWS_REGION
    });
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message
    });
  }
};


// Save Profile Picture Handler
export const saveProfilePicture = async (req, res) => {
  try {
    console.log('Save request received:', req.body);
    const { profilePicture } = req.body;
    const userId = req.user.id;

    if (!profilePicture) {
      return res.status(400).json({ error: "No profile picture provided" });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { profilePicture: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old image if exists
    if (user.profilePicture) {
      try {
        const oldUrl = new URL(user.profilePicture);
        const oldKey = oldUrl.pathname.substring(1); // Remove leading slash
        console.log('Deleting old S3 object:', oldKey);
        
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: oldKey
        }).promise();
      } catch (deleteError) {
        console.error('Old image deletion error:', deleteError.message);
        // Don't fail entire operation if deletion fails
      }
    }

    // Update database with new URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture },
      select: { id: true, profilePicture: true }
    });

    console.log('Database update successful:', updatedUser);
    
    res.status(200).json({
      message: "Profile picture saved successfully",
      profilePicture: updatedUser.profilePicture
    });
  } catch (error) {
    console.error('Save Profile Picture Error:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      body: req.body
    });
    res.status(500).json({ 
      error: "Failed to save profile picture",
      details: error.message 
    });
  }
};