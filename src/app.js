import express from "express";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import multer from "multer";

const app = express();
const upload = multer({ dest: "uploads/" }); // For file uploads

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Upload route example
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.json({ filePath: req.file.path });
});

// Error Handling Middleware
app.use(errorHandler);

export default app;
