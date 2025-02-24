import express from "express";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Stripe using the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Missing STRIPE_SECRET_KEY in environment variables.");
  process.exit(1);
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2022-11-15",
});

// Use the first URL from CLIENT_URL (if it's comma-separated)
const clientUrl = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")[0].trim()
  : "";
if (!clientUrl) {
  console.error("Missing CLIENT_URL in environment variables.");
  process.exit(1);
}

/**
 * POST /api/checkout/create-checkout-session
 * Expects a JSON body with:
 *   - userId: Number (or provided via auth middleware)
 *   - items: Array of items, each with { productId, quantity }
 */
router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("Stripe secret key:", process.env.STRIPE_SECRET_KEY);
    const { items, userId } = req.body;
    console.log("Received checkout request:", { items, userId });
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
        console.error(`Product not found for id: ${item.productId}`);
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
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
    console.log("Constructed line items:", line_items);
    console.log("Using clientUrl:", clientUrl);

    // Create the Stripe Checkout session.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout-cancelled`,
      metadata: { userId: userId.toString() },
    });
    console.log("Stripe session created successfully:", session.id);

    // Create an Order record with order items in your database.
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
    console.log("Order created with id:", order.id);

    // If the Payment model exists, create a Payment record.
    if (prisma.payment) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          userId: userId,
          stripeSessionId: session.id,
          amount: line_items.reduce(
            (acc, item) => acc + item.price_data.unit_amount * item.quantity,
            0
          ) / 100,
          status: "PENDING",
        },
      });
      console.log("Payment record created for session:", session.id);
    } else {
      console.warn("Payment model not defined in Prisma schema. Skipping payment record creation.");
    }

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/checkout/webhook
 * Listens for Stripe webhook events (e.g., checkout.session.completed)
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

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      (async () => {
        try {
          await prisma.payment.update({
            where: { stripeSessionId: session.id },
            data: { status: "COMPLETED" },
          });
          console.log("Payment status updated to COMPLETED for session:", session.id);
        } catch (err) {
          console.error("Error updating payment status:", err);
        }
      })();
    }

    res.json({ received: true });
  }
);

export default router;
