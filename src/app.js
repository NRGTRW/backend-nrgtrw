const express = require("express");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
