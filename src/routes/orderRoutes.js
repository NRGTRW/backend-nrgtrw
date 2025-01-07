const express = require("express");
const { createOrder, getOrders } = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // All order routes require authentication

router.post("/", createOrder); // Create a new order
router.get("/", getOrders); // Fetch user's orders

module.exports = router;
