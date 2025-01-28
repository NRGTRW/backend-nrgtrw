import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use an App Password if 2FA is enabled
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: "nrgoranov@gmail.com",
  subject: "Test Email",
  text: "If you received this email, Nodemailer is working.",
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Error sending email:", error);
  } else {
    console.log("Email sent:", info.response);
  }
});
