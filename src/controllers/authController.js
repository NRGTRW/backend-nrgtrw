import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


const prisma = new PrismaClient();

// Signup function
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP

    // ✅ Remove `newUser` since we don't need it
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
      },
    });

    // ✅ Send OTP email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2 style="color: #333;">Verify Your Email</h2>
          <p>Use the following OTP to verify your account:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f8f8f8; padding: 10px; display: inline-block;">
            ${otp}
          </div>
          <p style="margin-top: 10px;">This code is valid for <strong>10 minutes</strong>.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.status(201).json({ message: "Signup successful! Please verify your email with the OTP sent." });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ error: "Failed to create user." });
  }
};


// OTP Verification function
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== parseInt(otp) || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    // ✅ Mark the user as verified
    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiresAt: null },
    });

    // ✅ Generate a new token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Account verified successfully.", token });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    res.status(500).json({ error: "Failed to verify OTP." });
  }
};



// Login function
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: error.message || "Failed to log in" });
  }
};

// Transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


// Password reset function
export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // ✅ Ensure CLIENT_URL is defined and formatted properly
    const clientUrls = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : [];
    if (clientUrls.length === 0) {
      console.error("CLIENT_URL is not defined in the .env file");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // ✅ Choose the correct URL based on the request origin
    const preferredUrl = req.headers.origin && clientUrls.includes(req.headers.origin)
      ? req.headers.origin
      : clientUrls[0]; // Default to first URL if origin is unknown

    const resetLink = `${preferredUrl}/reset-password/${resetToken}`;
    console.log("Generated Reset Link:", resetLink); // Debugging log

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #555; text-align: center;">Password Reset Request</h2>
          <p>Hi <strong>${user.name || "there"}</strong>,</p>
          <p>You recently requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" target="_blank" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #999;">This link is valid for 15 minutes.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent successfully" });

  } catch (error) {
    console.error("Password reset error:", error.message);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
};



// Update password function (for handling after user clicks the reset link)
export const updatePassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Update password error:", error.message);
    res.status(500).json({ error: "Failed to update password." });
  }
};