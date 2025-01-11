import prisma from "../prisma/client.js"; // Import Prisma client
// import jwt from "jsonwebtoken";
import { NotFoundError, CustomError } from "../utils/errors.js";

// Fetch Profile
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      throw new NotFoundError("user");
    }

    res.status(200).json({
      name: user.profile?.name || user.name,
      email: user.email,
      address: user.profile?.address || "",
      phone: user.profile?.phone || "",
      profilePicture: user.profile?.profilePicture || "/default-profile.png"
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, address, phone } = req.body;

    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: { name, address, phone },
      create: { userId, name, address, phone }
    });

    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    next(error);
  }
};

// Upload Profile Picture
export const uploadProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      throw new CustomError("Bad Request", "No file uploaded", 400);
    }

    const filePath = `/uploads/${file.filename}`;
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: { profilePicture: filePath },
      create: { userId, profilePicture: filePath }
    });

    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    next(error);
  }
};
