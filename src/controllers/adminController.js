import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const assignAdminRole = async (req, res) => {
  if (req.user.role !== "ROOT_ADMIN") {
    return res
      .status(403)
      .json({ error: "Only root admin can assign admins." });
  }

  const { userId } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" }
    });
    res.json({ message: "User promoted to admin", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign admin role." });
  }
};

export const removeAdminRole = async (req, res) => {
  if (req.user.role !== "ROOT_ADMIN") {
    return res
      .status(403)
      .json({ error: "Only root admin can remove admins." });
  }

  const { userId } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: "USER" }
    });
    res.json({ message: "User demoted from admin", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove admin role." });
  }
};

// Analytics controller
export const getAnalytics = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get active users (verified)
    const activeUsers = await prisma.user.count({
      where: { isVerified: true }
    });

    // Get new users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo
        }
      }
    });

    // Get total orders and revenue
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
        payment: true
      }
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.payment?.amount || 0);
    }, 0);

    // Calculate conversion rate (orders / users)
    const conversionRate = totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(2) : 0;

    // Get top products (mock data for now)
    const topProducts = [];

    // Get recent activity (mock data for now)
    const recentActivity = [];

    res.json({
      totalUsers,
      activeUsers,
      totalOrders,
      totalRevenue,
      newUsersThisWeek,
      conversionRate,
      topProducts,
      recentActivity
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// Orders controller
export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: {
              include: {
                translations: {
                  where: { language: 'en' },
                  take: 1
                }
              }
            }
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      user: order.user,
      products: order.orderItems.map(item => ({
        name: item.product.translations[0]?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price
      })),
      total: order.payment?.amount || 0,
      status: order.payment?.status || 'pending',
      createdAt: order.createdAt
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Activity log controller
export const getActivityLog = async (req, res) => {
  try {
    // For now, return mock activity log data
    // In a real implementation, you'd have an ActivityLog model
    const activityLog = [
      {
        id: 1,
        user: { name: "Admin User" },
        action: "User role updated",
        details: "Changed user role from USER to ADMIN",
        timestamp: new Date()
      },
      {
        id: 2,
        user: { name: "System" },
        action: "Order created",
        details: "New order #123 created",
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 3,
        user: { name: "Admin User" },
        action: "Product updated",
        details: "Updated product details for Bamboo T-Shirt",
        timestamp: new Date(Date.now() - 7200000)
      }
    ];

    res.json(activityLog);
  } catch (error) {
    console.error("Error fetching activity log:", error);
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
};

// System health controller
export const getSystemHealth = async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    const database = 'Connected';

    // Get system uptime (mock data)
    const uptime = process.uptime();
    const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryFormatted = `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`;

    res.json({
      status: 'ok',
      uptime: uptimeFormatted,
      database,
      memory: memoryFormatted
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    res.status(500).json({
      status: 'error',
      uptime: 'Unknown',
      database: 'Disconnected',
      memory: 'Unknown'
    });
  }
};
