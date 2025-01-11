import prisma from "../prisma/client.js"; // Update to ES Module syntax
// import jwt from "jsonwebtoken";

// Fetch Profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      name: user.profile?.name || user.name,
      email: user.email,
      address: user.profile?.address || "",
      phone: user.profile?.phone || "",
      profilePicture: user.profile?.profilePicture || "/default-profile.png"
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
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
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Upload Profile Picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = `/uploads/${file.filename}`;
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: { profilePicture: filePath },
      create: { userId, profilePicture: filePath }
    });

    res.status(200).json({ profile: updatedProfile });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
