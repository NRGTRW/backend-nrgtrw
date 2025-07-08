import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://api.nrgtrw.com",
  "https://www.nrgtrw.com",
  "https://nrgtrw.com"
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
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token", "Cache-Control"],
    credentials: true
  })
);

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // Limit each IP to 1000 requests per windowMs
  })
);

// Static File Serving for Uploaded Files
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root Route
app.get("/", (req, res) => {
  res.send("Welcome to the NRG Backend Server! The API is running.");
});

// Health Check Route
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
app.use("/api/profile", profileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/checkout", checkoutRoutes);

// Test Database Route
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Database connection test failed:", error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Catch-All Route for Undefined Paths
app.use((req, res) => {
  res.status(404).json({
    error: "The requested resource could not be found on this server."
  });
});

// Global Error Handler
app.use(errorMiddleware);

// hCaptcha API Call with Exponential Backoff
async function fetchWithExponentialBackoff(url, maxRetries = 5) {
  let retries = 0;
  const initialDelay = 1000; // Start with a 1-second delay

  while (retries < maxRetries) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      } else if (response.status === 429) {
        const delay = Math.min(initialDelay * (2 ** retries), 30000); // Max delay of 30 seconds
        console.warn(`Rate limited. Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error(`Request failed: ${error.message}`);
      retries++;
    }
  }

  throw new Error('Max retries exceeded');
}

// Example Usage of hCaptcha API Call
app.get("/api/hcaptcha", async (req, res) => {
  try {
    const captchaData = await fetchWithExponentialBackoff('https://api.hcaptcha.com/getcaptcha/463b917e-e264-403f-ad34-34af0ee10294');
    res.json({ success: true, data: captchaData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Server Listener
const PORT = process.env.PORT || 8088;
// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, "../client/dist"))); // Update path if needed

// Catch-all Route to Serve React App
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
});