const prisma = require("../utils/prisma");

const createOrder = async (req, res, next) => {
  const { userId } = req.user;
  const { items } = req.body; // Items will be an array of product IDs and quantities

  try {
    // Fetch user profile and validate address/phone
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile || !profile.address || !profile.phone) {
      return res.status(400).json({
        message:
          "Please complete your profile (address and phone) before placing an order."
      });
    }

    // Calculate total price
    let totalPrice = 0;
    const orderItems = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        totalPrice += product.price * item.quantity;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        };
      })
    );

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        items: {
          create: orderItems
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders };
