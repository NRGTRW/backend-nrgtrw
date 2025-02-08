import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: process.env.AWS_REGION || "eu-central-1"
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only images are allowed"), false);
  }
});

const handleMulterErrors = (error, req, res, next) => {
  error instanceof multer.MulterError
    ? res.status(400).json({ error: error.message })
    : error
      ? res.status(400).json({ error: error.message })
      : next();
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");
    if (!process.env.AWS_S3_BUCKET_NAME) throw new Error("S3 misconfigured");

    const fileKey = `ProfilePictures/${Date.now()}-${uuidv4()}-${req.file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      })
    );

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.json({ previewPath: publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      error: "Upload failed",
      details: error.message
    });
  }
};

export const saveProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body;
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profilePicture: true }
    });

    if (user?.profilePicture) {
      try {
        const oldKey = new URL(user.profilePicture).pathname.substring(1);
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: oldKey
          })
        );
      } catch (deleteError) {
        console.error("Old image deletion error:", deleteError);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture },
      select: { profilePicture: true }
    });

    res.json({
      success: true,
      data: updatedUser.profilePicture
    });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save profile picture"
    });
  }
};

export { upload, handleMulterErrors };
