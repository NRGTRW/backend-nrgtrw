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
import logger from "./utils/logger.js";
import { PrismaClient } from "@prisma/client";


dotenv.config();
const app = express();
const prisma = new PrismaClient();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Frontend development environment
  "http://localhost:5174", // Another local frontend instance
  "https://your-production-domain.com", // Production domain
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
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(helmet());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later.",
  })
);

// Logging Middleware (Optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Default root route
app.get("/", (req, res) => {
  res.send("Welcome to the NRG Backend Server! The API is running.");
});

// Health check route
app.get("/api/health", (req, res) =>
  res.status(200).json({ status: "Server is running smoothly!" })
);

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
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Catch-all route for undefined paths
app.use((req, res, next) => {
  res.status(404).json({
    error: "The requested resource could not be found on this server.",
  });
});

// Global error handler
app.use(errorMiddleware);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
