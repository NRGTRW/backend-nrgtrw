import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/authMiddleware.js";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/fitness/programs - Get all active fitness programs
router.get("/programs", async (req, res) => {
  try {
    const programs = await prisma.fitnessProgram.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });
    res.json(programs);
  } catch (error) {
    console.error("Error fetching fitness programs:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// GET /api/fitness/programs/:id - Get specific program
router.get("/programs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const program = await prisma.fitnessProgram.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }
    
    res.json(program);
  } catch (error) {
    console.error("Error fetching fitness program:", error);
    res.status(500).json({ error: "Failed to fetch program" });
  }
});

// GET /api/fitness/user-access - Check user's access to programs (requires auth)
router.get("/user-access", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's purchases
    const purchases = await prisma.fitnessPurchase.findMany({
      where: { 
        userId,
        status: "COMPLETED"
      },
      include: {
        program: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
    
    // Get user's active subscription
    const subscription = await prisma.fitnessSubscription.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
    
    // Get all programs
    const allPrograms = await prisma.fitnessProgram.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true
      }
    });
    
    // Determine access for each program
    const accessMap = {};
    allPrograms.forEach(program => {
      const hasPurchase = purchases.some(p => p.programId === program.id);
      const hasSubscription = !!subscription;
      accessMap[program.id] = hasPurchase || hasSubscription;
    });
    
    res.json({
      purchases: purchases.map(p => p.program.id),
      hasSubscription: !!subscription,
      subscriptionExpiresAt: subscription?.expiresAt,
      accessMap
    });
  } catch (error) {
    console.error("Error checking user access:", error);
    res.status(500).json({ error: "Failed to check access" });
  }
});

// POST /api/fitness/purchase - Record a fitness program purchase
router.post("/purchase", protect, async (req, res) => {
  try {
    const { programId, stripeSessionId, amount } = req.body;
    const userId = req.user.id;
    
    const purchase = await prisma.fitnessPurchase.create({
      data: {
        userId,
        programId: parseInt(programId),
        stripeSessionId,
        amount: parseFloat(amount)
      }
    });
    
    res.json(purchase);
  } catch (error) {
    console.error("Error recording purchase:", error);
    res.status(500).json({ error: "Failed to record purchase" });
  }
});

// POST /api/fitness/subscription - Record a fitness subscription
router.post("/subscription", protect, async (req, res) => {
  try {
    const { stripeSessionId, stripePriceId } = req.body;
    const userId = req.user.id;
    
    const subscription = await prisma.fitnessSubscription.create({
      data: {
        userId,
        stripeSessionId,
        stripePriceId
      }
    });
    
    res.json(subscription);
  } catch (error) {
    console.error("Error recording subscription:", error);
    res.status(500).json({ error: "Failed to record subscription" });
  }
});

// ========== ADMIN ROUTES ==========

// GET /api/fitness/admin/programs - Get all programs (admin only)
router.get("/admin/programs", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const programs = await prisma.fitnessProgram.findMany({
      orderBy: { createdAt: "asc" }
    });
    res.json(programs);
  } catch (error) {
    console.error("Error fetching all fitness programs:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// POST /api/fitness/admin/programs - Create new program (admin only)
router.post("/admin/programs", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { title, description, image, video, pdfUrl, price, stripePriceId, isActive } = req.body;
    
    const program = await prisma.fitnessProgram.create({
      data: {
        title,
        description,
        image,
        video: video || null,
        pdfUrl: pdfUrl || null,
        price: parseFloat(price),
        stripePriceId: stripePriceId || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.status(201).json(program);
  } catch (error) {
    console.error("Error creating fitness program:", error);
    res.status(500).json({ error: "Failed to create program" });
  }
});

// PUT /api/fitness/admin/programs/:id - Update program (admin only)
router.put("/admin/programs/:id", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, image, video, pdfUrl, price, stripePriceId, isActive } = req.body;
    
    const program = await prisma.fitnessProgram.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        image,
        video: video || null,
        pdfUrl: pdfUrl || null,
        price: parseFloat(price),
        stripePriceId: stripePriceId || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.json(program);
  } catch (error) {
    console.error("Error updating fitness program:", error);
    res.status(500).json({ error: "Failed to update program" });
  }
});

// PATCH /api/fitness/admin/programs/:id/toggle - Toggle program active status (admin only)
router.patch("/admin/programs/:id/toggle", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentProgram = await prisma.fitnessProgram.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!currentProgram) {
      return res.status(404).json({ error: "Program not found" });
    }
    
    const program = await prisma.fitnessProgram.update({
      where: { id: parseInt(id) },
      data: { isActive: !currentProgram.isActive }
    });
    
    res.json(program);
  } catch (error) {
    console.error("Error toggling fitness program:", error);
    res.status(500).json({ error: "Failed to toggle program" });
  }
});

// DELETE /api/fitness/admin/programs/:id - Delete program (admin only)
router.delete("/admin/programs/:id", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if program has any purchases
    const purchases = await prisma.fitnessPurchase.findMany({
      where: { programId: parseInt(id) }
    });
    
    if (purchases.length > 0) {
      return res.status(400).json({ 
        error: "Cannot delete program with existing purchases. Deactivate instead." 
      });
    }
    
    await prisma.fitnessProgram.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting fitness program:", error);
    res.status(500).json({ error: "Failed to delete program" });
  }
});

// ========== SUBSCRIPTION MANAGEMENT ROUTES ==========

// GET /api/fitness/admin/subscriptions - Get all subscriptions (admin only)
router.get("/admin/subscriptions", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const subscriptions = await prisma.fitnessSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// PATCH /api/fitness/admin/subscriptions/:id/cancel - Cancel subscription (admin only)
router.patch("/admin/subscriptions/:id/cancel", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await prisma.fitnessSubscription.update({
      where: { id: parseInt(id) },
      data: { 
        expiresAt: new Date(),
        status: "CANCELLED"
      }
    });
    
    res.json(subscription);
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// ========== ANALYTICS ROUTES ==========

// GET /api/fitness/admin/analytics - Get fitness analytics (admin only)
router.get("/admin/analytics", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    // Get total programs
    const totalPrograms = await prisma.fitnessProgram.count();
    const activePrograms = await prisma.fitnessProgram.count({ where: { isActive: true } });
    
    // Get total purchases
    const totalPurchases = await prisma.fitnessPurchase.count();
    const totalRevenue = await prisma.fitnessPurchase.aggregate({
      _sum: { amount: true }
    });
    
    // Get total subscriptions
    const totalSubscriptions = await prisma.fitnessSubscription.count();
    const activeSubscriptions = await prisma.fitnessSubscription.count({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
    
    // Get recent activity
    const recentPurchases = await prisma.fitnessPurchase.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        program: { select: { title: true } }
      }
    });
    
    const recentSubscriptions = await prisma.fitnessSubscription.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    // Get program popularity
    const programStats = await prisma.fitnessPurchase.groupBy({
      by: ['programId'],
      _count: { id: true },
      include: {
        program: { select: { title: true } }
      }
    });
    
    res.json({
      overview: {
        totalPrograms,
        activePrograms,
        totalPurchases,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalSubscriptions,
        activeSubscriptions
      },
      recentActivity: {
        purchases: recentPurchases,
        subscriptions: recentSubscriptions
      },
      programStats
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// ========== ENHANCED PROGRAM ROUTES ==========

// GET /api/fitness/admin/programs/:id/stats - Get program statistics (admin only)
router.get("/admin/programs/:id/stats", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const purchases = await prisma.fitnessPurchase.findMany({
      where: { programId: parseInt(id) },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    
    const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    const uniqueUsers = new Set(purchases.map(p => p.userId)).size;
    
    res.json({
      totalPurchases: purchases.length,
      totalRevenue,
      uniqueUsers,
      purchases
    });
  } catch (error) {
    console.error("Error fetching program stats:", error);
    res.status(500).json({ error: "Failed to fetch program statistics" });
  }
});

// ========== BULK OPERATIONS ==========

// POST /api/fitness/admin/programs/bulk-toggle - Bulk toggle programs (admin only)
router.post("/admin/programs/bulk-toggle", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { programIds, isActive } = req.body;
    
    if (!Array.isArray(programIds) || programIds.length === 0) {
      return res.status(400).json({ error: "Program IDs array is required" });
    }
    
    const result = await prisma.fitnessProgram.updateMany({
      where: { id: { in: programIds.map(id => parseInt(id)) } },
      data: { isActive }
    });
    
    res.json({ 
      message: `${result.count} programs ${isActive ? 'activated' : 'deactivated'} successfully`,
      updatedCount: result.count
    });
  } catch (error) {
    console.error("Error bulk toggling programs:", error);
    res.status(500).json({ error: "Failed to bulk toggle programs" });
  }
});

// ========== EXPORT ROUTES ==========

// GET /api/fitness/admin/export/purchases - Export purchases data (admin only)
router.get("/admin/export/purchases", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const purchases = await prisma.fitnessPurchase.findMany({
      include: {
        user: { select: { name: true, email: true } },
        program: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    
    const csvData = purchases.map(purchase => ({
      'Purchase ID': purchase.id,
      'User Name': purchase.user.name,
      'User Email': purchase.user.email,
      'Program': purchase.program.title,
      'Amount': purchase.amount,
      'Stripe Session': purchase.stripeSessionId,
      'Date': purchase.createdAt
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fitness-purchases.csv"');
    
    // Convert to CSV
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    res.send(csv);
  } catch (error) {
    console.error("Error exporting purchases:", error);
    res.status(500).json({ error: "Failed to export purchases" });
  }
});

// GET /api/fitness/admin/export/subscriptions - Export subscriptions data (admin only)
router.get("/admin/export/subscriptions", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const subscriptions = await prisma.fitnessSubscription.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    
    const csvData = subscriptions.map(subscription => ({
      'Subscription ID': subscription.id,
      'User Name': subscription.user.name,
      'User Email': subscription.user.email,
      'Stripe Price ID': subscription.stripePriceId,
      'Stripe Session': subscription.stripeSessionId,
      'Status': subscription.status || 'ACTIVE',
      'Expires At': subscription.expiresAt,
      'Created At': subscription.createdAt
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fitness-subscriptions.csv"');
    
    // Convert to CSV
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    res.send(csv);
  } catch (error) {
    console.error("Error exporting subscriptions:", error);
    res.status(500).json({ error: "Failed to export subscriptions" });
  }
});

export default router; 