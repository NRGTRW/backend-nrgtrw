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

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this IP, please try again later."
  })
);

// Default root route
app.get("/", (req, res) => {
  res.send("Welcome to the NRG Backend Server! The API is running.");
});

// Health check route
app.get("/api/health", (req, res) =>
  res.status(200).json({ status: "Server is running smoothly!" })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Catch-all route for undefined paths
app.use((req, res, next) => {
  res.status(404).json({
    error: "The requested resource could not be found on this server."
  });
});

// Global error handler
app.use(errorMiddleware);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
