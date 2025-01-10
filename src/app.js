const express = require("express");
const cors = require("cors");
const profileRoutes = require("./routes/profile");
// eslint-disable-next-line no-unused-vars
const prisma = require("./prisma/client");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/profile", profileRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
