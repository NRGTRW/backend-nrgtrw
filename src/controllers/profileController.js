import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  try {
    const user = req.user; // Retrieved by `authMiddleware`
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Failed to load profile:", error);
    res.status(500).json({ error: "Failed to load profile" });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, profilePicture } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, profilePicture },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};
