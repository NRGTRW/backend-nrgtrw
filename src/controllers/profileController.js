const prisma = require("../utils/prisma");

const updateProfile = async (req, res, next) => {
  const { userId } = req.user;
  const { address, phone } = req.body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { address, phone },
      create: { userId, address, phone },
    });
    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, getProfile };
