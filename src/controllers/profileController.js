import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure `req.user` is populated from the JWT middleware.
    const profile = await prisma.user.findUnique({ where: { id: userId } });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
};


export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, address, phone } = req.body;

  try {
    const updatedProfile = await prisma.user.update({
      where: { id: userId },
      data: { name, address, phone },
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
};
