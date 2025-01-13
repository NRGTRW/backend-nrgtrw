import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Signup request body:", req.body); // Log the incoming data

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Signup error:", error); // Log the error for debugging
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found." });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Failed to log in." });
  }
};
