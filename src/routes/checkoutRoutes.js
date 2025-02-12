import express from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Stripe using only the secret key (ensure STRIPE_SECRET_KEY contains only the secret key)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Missing STRIPE_SECRET_KEY in environment variables.");
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2022-11-15",
});

// Use the first URL from CLIENT_URL (if it's comma-separated)
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",")[0].trim() : "";

/**
 * POST /api/checkout/create-checkout-session
 * Expects a JSON body with:
 *   - userId: Number (or you may retrieve it via authentication middleware)
 *   - items: Array of items, each with { productId, quantity }
 */
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items, userId } = req.body;
    if (!items || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Build Stripe line items by fetching product details from the database.
    const line_items = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return res
          .status(404)
          .json({ error: `Product not found: ${item.productId}` });
      }
      line_items.push({
        price_data: {
          currency: "usd", // Adjust as needed.
          product_data: {
            name: product.name,
            images: product.imageUrl ? [product.imageUrl] : [],
            description: product.description,
          },
          unit_amount: Math.round(product.price * 100), // Convert dollars to cents.
        },
        quantity: item.quantity,
      });
    }

    // Create the Stripe Checkout session.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout-cancelled`,
      metadata: { userId: userId.toString() },
    });

    // (Optional) Create an Order record with order items in your database.
    const order = await prisma.order.create({
      data: {
        userId: userId,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    // (Optional) Create a Payment record to track the payment status.
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: userId,
        stripeSessionId: session.id,
        amount:
          line_items.reduce(
            (acc, item) => acc + item.price_data.unit_amount * item.quantity,
            0
          ) / 100,
        status: "PENDING",
      },
    });

    console.log("Stripe session created successfully:", session.id);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/checkout/webhook
 * This endpoint listens for Stripe webhook events (e.g., checkout.session.completed)
 *
 * IMPORTANT:
 * - Configure the endpoint URL in your Stripe Dashboard.
 * - The raw body is needed to verify the webhook signature.
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event.
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      (async () => {
        try {
          await prisma.payment.update({
            where: { stripeSessionId: session.id },
            data: { status: "COMPLETED" },
          });
          // Optionally, update your order record here as well.
        } catch (err) {
          console.error("Error updating payment status:", err);
        }
      })();
    }

    res.json({ received: true });
  }
);

export default router;
