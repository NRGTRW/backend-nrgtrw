import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * ✅ Assign Admin Role (Root Admin Only)
 */
export const assignAdminRole = async (req, res) => {
  if (req.user.role !== "root_admin") {
    return res.status(403).json({ error: "Only root admin can assign admins." });
  }

  const { userId } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" }
    });
    res.json({ message: "User promoted to admin", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign admin role." });
  }
};

/**
 * ✅ Remove Admin Role (Root Admin Only)
 */
export const removeAdminRole = async (req, res) => {
  if (req.user.role !== "root_admin") {
    return res.status(403).json({ error: "Only root admin can remove admins." });
  }

  const { userId } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "user" }
    });
    res.json({ message: "User demoted from admin", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove admin role." });
  }
};
