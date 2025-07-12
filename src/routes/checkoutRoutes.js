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
    const { items, userId, type } = req.body;
    console.log("Received checkout request:", { items, userId, type });
    if (!items || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const line_items = [];
    if (type === "fitness_one_time") {
      // Handle fitness program checkout as virtual product
      const s3BaseUrl = "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/";
      for (const item of items) {
        // Ensure image is an absolute S3 URL
        let imageUrl = item.image;
        if (imageUrl && !imageUrl.startsWith("http")) {
          imageUrl = `${s3BaseUrl}${imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl}`;
        }
        line_items.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name || "Fitness Program",
              images: imageUrl ? [imageUrl] : [],
              description: item.description || "Premium fitness program.",
            },
            unit_amount: 5000, // $50 in cents
          },
          quantity: item.quantity,
        });
      }
    } else {
      // Default: Clothing/products from DB
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { translations: true },
        });
        if (!product || !product.translations || product.translations.length === 0) {
          console.error(`No translations found for product id: ${item.productId}`);
          return res
            .status(404)
            .json({ error: `Product translation not found: ${item.productId}` });
        }
        // Look for an English translation.
        let translation = product.translations.find((t) => t.language === "en");
        if (!translation) {
          console.warn(
            `No English translation for product id: ${item.productId}. Falling back to defaults.`
          );
          translation = {
            name: product.translations[0].name, // Fallback to first available translation
            description: "Description not available in English.",
            imageUrl: "images/default.png", // Fallback relative path
          };
        }

        // Determine the image URL.
        let imageUrl = translation.imageUrl;
        const s3BaseUrl = "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/";
        if (imageUrl && !imageUrl.startsWith("http")) {
          imageUrl = `${s3BaseUrl}${imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl}`;
        }
        if (imageUrl.includes("WhiteShirt")) {
          imageUrl = "https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/WhiteCroppedTurtuleneck.webp";
        }

        line_items.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: translation.name,
              images: imageUrl ? [imageUrl] : [],
              description: translation.description,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.quantity,
        });
      }
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

    // Only create an Order for non-fitness products (optional, or you can skip for virtual)
    if (type !== "fitness_one_time") {
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

      // Create a Payment record to track the payment status.
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
          // Update payment status
          await prisma.payment.update({
            where: { stripeSessionId: session.id },
            data: { status: "COMPLETED" },
          });
          console.log("Payment status updated to COMPLETED for session:", session.id);
          
          // Check if this is a fitness program purchase
          const fitnessPurchase = await prisma.fitnessPurchase.findFirst({
            where: { stripeSessionId: session.id }
          });
          
          if (fitnessPurchase) {
            // Update fitness purchase status
            await prisma.fitnessPurchase.update({
              where: { id: fitnessPurchase.id },
              data: { status: "COMPLETED" }
            });
            console.log("Fitness purchase status updated to COMPLETED for session:", session.id);
          }
          
          // Check if this is a fitness subscription
          const fitnessSubscription = await prisma.fitnessSubscription.findFirst({
            where: { stripeSessionId: session.id }
          });
          
          if (fitnessSubscription) {
            // Update fitness subscription status
            await prisma.fitnessSubscription.update({
              where: { id: fitnessSubscription.id },
              data: { status: "COMPLETED" }
            });
            console.log("Fitness subscription status updated to COMPLETED for session:", session.id);
          }
        } catch (err) {
          console.error("Error updating payment status:", err);
        }
      })();
    }

    res.json({ received: true });
  }
);

export default router;