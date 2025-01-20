import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import { PrismaClient } from "@prisma/client";
import wishlistRoutes from "./routes/wishlistRoutes.js";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
<<<<<<< HEAD
  "https://nrgtrw.com",
  "https://www.nrgtrw.com",
=======
  "https://api.nrgtrw.com",
  "https://www.nrgtrw.com",
  "https://nrgtrw.com",
>>>>>>> 3c9a99ef3612877e81e7a058fd45662d4069eecb
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
    credentials: true,
  })
);

// Middleware
app.use(helmet());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
<<<<<<< HEAD
    max: 100000,
=======
    max: 100,
>>>>>>> 3c9a99ef3612877e81e7a058fd45662d4069eecb
    message: "Too many requests from this IP, please try again later.",
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Default root route
app.get("/", (req, res) => {
  res.send("Welcome to the NRG Backend Server! The API is running.");
});

// Health check route
app.get("/health", (req, res) => res.status(200).send("API is running."));

// Database Health Check Route
app.get("/api/db-health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "Database is connected" });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes); // Updated to align API route
app.use('/api/products', productRoutes);
app.use("/api/cart", cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Database connection test failed:", error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Catch-all route for undefined paths
app.use((req, res) => {
  res.status(404).json({
    error: "The requested resource could not be found on this server.",
  });
});

// Global error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
