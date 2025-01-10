/* eslint-disable no-unused-vars */
// Backend Initialization with Prisma and Node.js (ES Module Syntax)

// Step 1: Setup Dependencies
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod"; // For validation
import winston from "winston"; // For logging

// Configure dotenv to load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Configure Multer for File Uploads
const upload = multer({ dest: "uploads/" });

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

// Winston Logger Configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.Console(),
  ],
});

// Step 2: Define API Endpoints

// Signup with validation
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

app.post("/api/signup", async (req, res, next) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
});

app.post("/api/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found." });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid password." });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

app.get("/api/profile", async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

app.put("/api/profile", async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    const { name, address, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, address, phone },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/profile/upload",
  upload.single("profilePicture"),
  async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    try {
      const { userId } = jwt.verify(token, JWT_SECRET);
      const profilePicture = `/uploads/${req.file.filename}`;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profilePicture },
      });

      res.json({ profile: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

app.get("/api/products", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

app.post("/api/products", async (req, res, next) => {
  const { name, price, imageUrl } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, price, imageUrl },
    });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

app.get("/api/cart", async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    const cart = await prisma.cart.findMany({ where: { userId } });
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

app.post("/api/cart", async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    const { productId, quantity } = req.body;

    const cartItem = await prisma.cart.create({
      data: {
        userId,
        productId,
        quantity,
      },
    });

    res.json(cartItem);
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running smoothly!" });
});

app.get("/", (req, res) => {
  res.send("Welcome to the NRG Backend Server!");
});

const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});
