import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/authMiddleware.js";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";
import transporter from '../utils/smtpConfig.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/clothing-vote/join - Join the clothing vote for a specific category
router.post("/join", async (req, res) => {
  try {
    const { email, name, phone, message, categoryId, priceRange } = req.body;
    
    // Validate required fields
    if (!email || !name || !categoryId) {
      return res.status(400).json({ error: "Email, name, and category are required" });
    }

    // Validate categoryId (1: Elegance, 2: Pump Covers, 3: Confidence)
    if (![1, 2, 3].includes(categoryId)) {
      return res.status(400).json({ error: "Invalid category ID" });
    }

    // Check if email is already voted for this category
    const existingVote = await prisma.clothingVote.findFirst({ 
      where: { email, categoryId } 
    });
    
    if (existingVote) {
      return res.status(400).json({ error: "You have already voted for this category" });
    }

    // Create clothing vote entry
    const voteEntry = await prisma.clothingVote.create({
      data: {
        email,
        name,
        phone: phone || null,
        message: message || null,
        categoryId,
        priceRange: priceRange || null,
        status: "WAITING"
      }
    });

    // Get vote count and position for this category
    const allVotes = await prisma.clothingVote.findMany({
      where: { categoryId },
      orderBy: { createdAt: "asc" }
    });
    
    const totalVotes = allVotes.length;
    const position = allVotes.findIndex(vote => vote.email === email) + 1;

    // Get category name for email
    const categoryNames = {
      1: "Elegance",
      2: "Pump Covers", 
      3: "Confidence"
    };
    const categoryName = categoryNames[categoryId];

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Vote for ${categoryName} Collection - NRG Clothing`,
      html: `
        <table role="presentation" style="width: 100%; text-align: center; padding: 20px; font-family: 'Playfair Display', Arial, serif; background: #181818; color: #fff;">
          <tr>
            <td align="center">
              <table role="presentation" style="width: 100%; max-width: 420px; border-radius: 16px; overflow: hidden; box-shadow: 0px 4px 18px rgba(191,161,74,0.18); background: #23211a;">
                <tr>
                  <td align="center" valign="middle" style="background: url('https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/HeroImage.webp') no-repeat center center; background-size: cover; text-align: center; color: white; position: relative; border-radius: 16px; padding: 0;">
                    <table role="presentation" width="100%" height="100%" style="background: rgba(0,0,0,0.68); border-radius: 16px; padding: 32px 18px; text-align: center;">
                      <tr><td align="center">
                        <h2 style="margin: 10px 0 0 0; font-size: 1.5rem; font-family: 'Playfair Display', serif; color: #ffe067;">Vote Received!</h2>
                        <h3 style="margin: 8px 0 18px 0; font-size: 1.1rem; color: #fffbe6; font-family: 'Inter', Arial, sans-serif;">${categoryName} Collection</h3>
                        <p style="font-size: 1rem; color: #ffe067; margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
                        <p style="font-size: 1rem; color: #fff; margin: 0 0 12px 0;">Your vote for the <strong>${categoryName}</strong> collection has been recorded!</p>
                        <p style="font-size: 1rem; color: #fff; margin: 0 0 12px 0;">You are vote <strong>#${position}</strong> out of <strong>${totalVotes}</strong> for this collection.</p>
                        <div style="margin: 18px 0;">
                          <div style="background: #333; border-radius: 8px; overflow: hidden; width: 80%; margin: 0 auto;">
                            <div style="height: 18px; background: linear-gradient(90deg, #ffe067 0%, #bfa14a 100%); width: ${(position && totalVotes) ? Math.round((position/totalVotes)*100) : 0}%; transition: width 0.4s;"></div>
                          </div>
                          <div style="font-size: 0.95rem; color: #ffe067; margin-top: 6px;">${position === 1 ? 'You were the first to vote!' : `You're in the top ${Math.round((position/totalVotes)*100)}% of voters!`}</div>
                        </div>
                        <p style="font-size: 1rem; color: #fff; margin: 0 0 12px 0;">As a voter, you'll receive:</p>
                        <ul style="list-style: none; padding: 0; color: #ffe067; font-size: 1rem;">
                          <li>✨ Early access when the collection launches</li>
                          <li>💎 Exclusive discount codes</li>
                          <li>🛎️ Priority customer support</li>
                          <li>🎬 Behind-the-scenes updates</li>
                        </ul>
                        <p style="font-size: 0.95rem; color: #fffbe6; margin: 18px 0 0 0;">We'll notify you as soon as we have enough interest to produce this collection!</p>
                        <p style="font-size: 0.9rem; color: #bfa14a; margin: 18px 0 0 0;">Thank you for your interest in NRG.<br/>— NRGTRW Team</p>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `
    });

    res.status(201).json({
      message: "Successfully voted for the collection!",
      voteEntry,
      position,
      totalVotes
    });
  } catch (error) {
    console.error("Error joining clothing vote:", error);
    res.status(500).json({ error: "Failed to submit vote" });
  }
});

// GET /api/clothing-vote/check - Check if email has voted for a category
router.get("/check", async (req, res) => {
  try {
    const { email, categoryId } = req.query;
    
    if (!email || !categoryId) {
      return res.status(400).json({ error: "Email and categoryId are required" });
    }

    const voteEntry = await prisma.clothingVote.findFirst({ 
      where: { email, categoryId: parseInt(categoryId) } 
    });

    // Get vote count and position for this category
    const allVotes = await prisma.clothingVote.findMany({
      where: { categoryId: parseInt(categoryId) },
      orderBy: { createdAt: "asc" }
    });
    
    const totalVotes = allVotes.length;
    let position = null;
    
    if (voteEntry) {
      position = allVotes.findIndex(vote => vote.email === email) + 1;
    }

    res.json({
      hasVoted: !!voteEntry,
      entry: voteEntry,
      position,
      totalVotes
    });
  } catch (error) {
    console.error("Error checking clothing vote status:", error);
    res.status(500).json({ error: "Failed to check vote status" });
  }
});

// GET /api/clothing-vote/stats - Get voting statistics for all categories
router.get("/stats", async (req, res) => {
  try {
    const stats = await Promise.all([
      prisma.clothingVote.count({ where: { categoryId: 1 } }), // Elegance
      prisma.clothingVote.count({ where: { categoryId: 2 } }), // Pump Covers
      prisma.clothingVote.count({ where: { categoryId: 3 } })  // Confidence
    ]);

    res.json({
      elegance: stats[0],
      pumpCovers: stats[1],
      confidence: stats[2],
      total: stats.reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    console.error("Error fetching clothing vote stats:", error);
    res.status(500).json({ error: "Failed to fetch voting statistics" });
  }
});

// ========== ADMIN ROUTES ==========

// GET /api/clothing-vote/admin - Get all clothing votes (admin only)
router.get("/admin", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { categoryId, status, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [votes, total] = await Promise.all([
      prisma.clothingVote.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.clothingVote.count({ where })
    ]);

    res.json({
      votes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching clothing votes:", error);
    res.status(500).json({ error: "Failed to fetch clothing votes" });
  }
});

// PATCH /api/clothing-vote/admin/:id - Update clothing vote status (admin only)
router.patch("/admin/:id", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    
    const voteEntry = await prisma.clothingVote.update({
      where: { id: parseInt(id) },
      data: {
        status: status || undefined,
        message: message || undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(voteEntry);
  } catch (error) {
    console.error("Error updating clothing vote:", error);
    res.status(500).json({ error: "Failed to update clothing vote" });
  }
});

// DELETE /api/clothing-vote/admin/:id - Remove clothing vote (admin only)
router.delete("/admin/:id", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.clothingVote.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Clothing vote deleted successfully" });
  } catch (error) {
    console.error("Error deleting clothing vote:", error);
    res.status(500).json({ error: "Failed to delete clothing vote" });
  }
});

export default router; 