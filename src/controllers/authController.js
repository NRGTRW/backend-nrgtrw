import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// 📌 Signup Function
const signup = async (req, res) => {
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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Account",
      html: `
        <table role="presentation" style="width: 100%; text-align: center; padding: 20px; font-family: Arial, sans-serif;">
          <tr>
            <td align="center">
              <!-- Business Card with Background Image -->
              <table role="presentation" style="width: 100%; max-width: 360px; border-radius: 12px; overflow: hidden; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);">
                <tr>
                  <td align="center" valign="middle" style="
                    width: 100%;
                    background: url('https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/HeroImage.webp') no-repeat center center;
                    background-size: cover;
                    text-align: center;
                    color: white;
                    position: relative;
                    border-radius: 12px;
                    padding: 0;
                  ">
                    <!-- Overlay for Readability -->
                    <table role="presentation" width="100%" height="100%" style="
                      background: rgba(0, 0, 0, 0.55);
                      border-radius: 12px;
                      padding: 20px;
                      text-align: center;
                    ">
                      <tr>
                        <td align="center">
                          <h3 style="margin: 10px 0; font-size: 18px; font-weight: bold;">Verify Your Email</h3>
                          <p style="font-size: 14px; margin: 5px 0;"><strong>Hi ${name || "there"},</strong></p>
                          <p style="font-size: 12px; margin-bottom: 12px;">Use the following OTP to verify your account:</p>
                          
                          <!-- ✅ OTP Styled Box -->
                          <div style="
                            display: inline-block;
                            background: #ffffff;
                            color: #333;
                            font-size: 22px;
                            font-weight: bold;
                            padding: 10px 20px;
                            border-radius: 8px;
                            border: 2px solid #007bff;
                            margin: 10px 0;
                          ">
                            ${otp}
                          </div>

                          <p style="font-size: 12px; margin-top: 10px;">This OTP is valid for <strong>10 minutes</strong>.</p>
                          <p style="font-size: 12px; color: #cccccc;">If you did not request this, you can safely ignore this email.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
    });

    res.status(201).json({ message: "Signup successful! Please verify your email with the OTP sent." });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ error: "Failed to create user." });
  }
};


// 📌 Login Function
 const login = async (req, res) => {
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

// 📌 Password Reset Function (with pre-filled email and background image)
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // ✅ Ensure CLIENT_URL is properly set
    const clientUrls = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : [];
    if (clientUrls.length === 0) return res.status(500).json({ error: "Server configuration error" });

    const preferredUrl = req.headers.origin && clientUrls.includes(req.headers.origin)
      ? req.headers.origin
      : clientUrls[0];

    const resetLink = `${preferredUrl.replace(/\/$/, "")}/reset-password/${resetToken}?email=${encodeURIComponent(user.email)}`;

    console.log("Generated Reset Link:", resetLink); // Debugging log

    // ✅ Send Reset Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <table role="presentation" style="width: 100%; text-align: center; padding: 20px; font-family: Arial, sans-serif;">
          <tr>
            <td align="center">
              <!-- Business Card with Background Image -->
              <table role="presentation" style="width: 100%; max-width: 360px; border-radius: 12px; overflow: hidden; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);">
                <tr>
                  <td align="center" valign="middle" style="
                    width: 100%;
                    background: url('https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/HeroImage.webp') no-repeat center center;
                    background-size: cover;
                    text-align: center;
                    color: white;
                    position: relative;
                    border-radius: 12px;
                    padding: 0;
                  ">
                    <!-- Overlay for Readability -->
                    <table role="presentation" width="100%" height="100%" style="
                      background: rgba(0, 0, 0, 0.55);
                      border-radius: 12px;
                      padding: 20px;
                      text-align: center;
                    ">
                      <tr>
                        <td align="center">
                          <h3 style="margin: 10px 0; font-size: 18px; font-weight: bold;">Reset Your Password</h3>
                          <p style="font-size: 14px; margin: 5px 0;"><strong>Hi ${user.name || "there"},</strong></p>
                          <p style="font-size: 12px; margin-bottom: 12px;">Click below to reset your password.</p>
                          
                          <!-- ✅ Button for Reset -->
                          <div style="display: inline-block; text-align: center;">
                            <a href="${resetLink}" target="_blank"
                               style="display: block; 
                                      background-color: #007bff; 
                                      color: #ffffff !important; 
                                      text-decoration: none; 
                                      padding: 12px 18px; 
                                      font-size: 14px; 
                                      font-weight: bold; 
                                      border-radius: 6px; 
                                      margin-top: 10px;
                                      width: 180px; /* Forces button width */
                                      text-align: center;">
                              Reset Password
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `,
    });
    
    res.status(200).json({ message: "Password reset email sent successfully" });

  } catch (error) {
    console.error("Password reset error:", error.message);
    res.status(500).json({ error: "Failed to send password reset email." });
  }
};

// 📌 Update Password Function
 const updatePassword = async (req, res) => {
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

// 📌 OTP Verification Function
 const verifyOTP = async (req, res) => {
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


export { signup, login, resetPassword, updatePassword, verifyOTP };
