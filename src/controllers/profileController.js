import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import { decrypt } from "../utils/cryptoUtils.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.user; // Retrieved by `authMiddleware`
    console.log("Fetched User:", user);

    const decryptedAddress = decrypt(user.address);
    const decryptedPhone = decrypt(user.phone);

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      address: decryptedAddress,
      phone: decryptedPhone,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Failed to load profile:", error.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
};





export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, phone, profilePicture } = req.body; // Added address and phone

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, address, phone, profilePicture }, // Updated data
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};
