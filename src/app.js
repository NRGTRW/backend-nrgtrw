import express from "express";
import multer from "multer";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/categories", categoryRoutes); // Category routes
app.use("/api/products", productRoutes); // Product routes
app.use("/api/profile", profileRoutes); // Profile routes

// File Upload Example
const upload = multer({ dest: "uploads/" });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ filePath: req.file.path });
});

// Error Handling Middleware
app.use(errorHandler);

export default app;
