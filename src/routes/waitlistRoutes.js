import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";
import transporter from '../utils/smtpConfig.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/waitlist/join - Join the global fitness waitlist (one entry per email)
router.post("/join", async (req, res) => {
  try {
    const { email, name, phone, message } = req.body;
    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({ error: "Email and name are required" });
    }
    // Check if email is already on the global waitlist
    const existingEntry = await prisma.fitnessWaitlist.findFirst({ where: { email } });
    if (existingEntry) {
      return res.status(400).json({ error: "You are already on the waitlist for all programs" });
    }
    // Create global waitlist entry
    const waitlistEntry = await prisma.fitnessWaitlist.create({
      data: {
        email,
        name,
        phone: phone || null,
        message: message || null,
        programId: null,
        status: "WAITING"
      }
    });
    // Get position and total for the global waitlist
    const allEntries = await prisma.fitnessWaitlist.findMany({
      where: { programId: null },
      orderBy: { createdAt: "asc" }
    });
    const total = allEntries.length;
    const position = allEntries.findIndex(entry => entry.email === email) + 1;
    // Send branded email (no program-specific info)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `You're on the Waitlist for All Fitness Programs!`,
      html: `
        <table role="presentation" style="width: 100%; text-align: center; padding: 20px; font-family: 'Playfair Display', Arial, serif; background: #181818; color: #fff;">
          <tr>
            <td align="center">
              <table role="presentation" style="width: 100%; max-width: 420px; border-radius: 16px; overflow: hidden; box-shadow: 0px 4px 18px rgba(191,161,74,0.18); background: #23211a;">
                <tr>
                  <td align="center" valign="middle" style="background: url('https://nrgtrw-images.s3.eu-central-1.amazonaws.com/images/HeroImage.webp') no-repeat center center; background-size: cover; text-align: center; color: white; position: relative; border-radius: 16px; padding: 0;">
                    <table role="presentation" width="100%" height="100%" style="background: rgba(0,0,0,0.68); border-radius: 16px; padding: 32px 18px; text-align: center;">
                      <tr><td align="center">
                        <h2 style="margin: 10px 0 0 0; font-size: 1.5rem; font-family: 'Playfair Display', serif; color: #ffe067;">Welcome to the Waitlist!</h2>
                        <h3 style="margin: 8px 0 18px 0; font-size: 1.1rem; color: #fffbe6; font-family: 'Inter', Arial, sans-serif;">All Fitness Programs</h3>
                        <p style="font-size: 1rem; color: #ffe067; margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
                        <p style="font-size: 1rem; color: #fff; margin: 0 0 12px 0;">You are now <strong>#${position}</strong> out of <strong>${total}</strong> on the global waitlist!</p>
                        <div style="margin: 18px 0;">
                          <div style="background: #333; border-radius: 8px; overflow: hidden; width: 80%; margin: 0 auto;">
                            <div style="height: 18px; background: linear-gradient(90deg, #ffe067 0%, #bfa14a 100%); width: ${(position && total) ? Math.round((position/total)*100) : 0}%; transition: width 0.4s;"></div>
                          </div>
                          <div style="font-size: 0.95rem; color: #ffe067; margin-top: 6px;">${position === 1 ? 'You are first in line!' : `You are in the top ${Math.round((position/total)*100)}% of the waitlist!`}</div>
                        </div>
                        <p style="font-size: 1rem; color: #fff; margin: 0 0 12px 0;">As a waitlist member, you'll receive:</p>
                        <ul style="list-style: none; padding: 0; color: #ffe067; font-size: 1rem;">
                          <li>✨ Early access to all program launches</li>
                          <li>💎 Exclusive discount codes</li>
                          <li>🛎️ Priority customer support</li>
                          <li>🎬 Behind-the-scenes updates</li>
                        </ul>
                        <p style="font-size: 0.95rem; color: #fffbe6; margin: 18px 0 0 0;">Stay tuned for sneak peeks, launch countdowns, and more luxury fitness content coming your way soon!</p>
                        <p style="font-size: 0.9rem; color: #bfa14a; margin: 18px 0 0 0;">Thank you for joining the movement.<br/>— NRGTRW Team</p>
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
      message: "Successfully joined the waitlist!",
      waitlistEntry
    });
  } catch (error) {
    console.error("Error joining waitlist:", error);
    res.status(500).json({ error: "Failed to join waitlist" });
  }
});

// GET /api/waitlist/status - Check waitlist status for a user
router.get("/status", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const waitlistEntries = await prisma.fitnessWaitlist.findMany({
      where: { userId },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(waitlistEntries);
  } catch (error) {
    console.error("Error fetching waitlist status:", error);
    res.status(500).json({ error: "Failed to fetch waitlist status" });
  }
});

// GET /api/waitlist/check - Check if email is on waitlist (for non-logged in users)
router.get("/check", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const waitlistEntry = await prisma.fitnessWaitlist.findFirst({ where: { email } });
    // Get position and total for the global waitlist
    const allEntries = await prisma.fitnessWaitlist.findMany({
      where: { programId: null },
      orderBy: { createdAt: "asc" }
    });
    const total = allEntries.length;
    let position = null;
    if (waitlistEntry) {
      position = allEntries.findIndex(entry => entry.email === email) + 1;
    }
    res.json({
      isOnWaitlist: !!waitlistEntry,
      entry: waitlistEntry,
      position,
      total
    });
  } catch (error) {
    console.error("Error checking waitlist status:", error);
    res.status(500).json({ error: "Failed to check waitlist status" });
  }
});

// ========== ADMIN ROUTES ==========

// GET /api/waitlist/admin - Get all waitlist entries (admin only)
router.get("/admin", authenticate, requireAdmin, async (req, res) => {
  try {
    const { programId, status, page = 1, limit = 50 } = req.query;
    
    const where = {};
    if (programId) where.programId = parseInt(programId);
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [waitlistEntries, total] = await Promise.all([
      prisma.fitnessWaitlist.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          program: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.fitnessWaitlist.count({ where })
    ]);

    res.json({
      waitlistEntries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching waitlist entries:", error);
    res.status(500).json({ error: "Failed to fetch waitlist entries" });
  }
});

// PATCH /api/waitlist/admin/:id - Update waitlist entry status (admin only)
router.patch("/admin/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    
    console.log("Updating waitlist entry:", { id, status, message });

    const waitlistEntry = await prisma.fitnessWaitlist.update({
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
        },
        program: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log("Updated waitlist entry:", waitlistEntry);
    res.json(waitlistEntry);
  } catch (error) {
    console.error("Error updating waitlist entry:", error);
    res.status(500).json({ error: "Failed to update waitlist entry" });
  }
});

// DELETE /api/waitlist/admin/:id - Remove waitlist entry (admin only)
router.delete("/admin/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.fitnessWaitlist.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Waitlist entry removed successfully" });
  } catch (error) {
    console.error("Error removing waitlist entry:", error);
    res.status(500).json({ error: "Failed to remove waitlist entry" });
  }
});

// GET /api/waitlist/admin/stats - Get waitlist statistics (admin only)
router.get("/admin/stats", authenticate, requireAdmin, async (req, res) => {
  try {
    const [totalWaiting, totalNotified, totalConverted, totalRemoved] = await Promise.all([
      prisma.fitnessWaitlist.count({ where: { status: "WAITING" } }),
      prisma.fitnessWaitlist.count({ where: { status: "NOTIFIED" } }),
      prisma.fitnessWaitlist.count({ where: { status: "CONVERTED" } }),
      prisma.fitnessWaitlist.count({ where: { status: "REMOVED" } })
    ]);

    // Get program stats by grouping waitlist entries
    const programStatsRaw = await prisma.fitnessWaitlist.groupBy({
      by: ['programId'],
      _count: {
        id: true
      },
      where: {
        status: "WAITING"
      }
    });

    // Get program details for the stats
    const programIds = programStatsRaw.map(stat => stat.programId).filter(id => id !== null);
    const programs = await prisma.fitnessProgram.findMany({
      where: {
        id: { in: programIds }
      },
      select: {
        id: true,
        title: true
      }
    });

    // Combine stats with program titles
    const programStats = programStatsRaw.map(stat => {
      const program = programs.find(p => p.id === stat.programId);
      return {
        programId: stat.programId,
        count: stat._count.id,
        programTitle: program ? program.title : 'Unknown Program'
      };
    });

    res.json({
      totalWaiting,
      totalNotified,
      totalConverted,
      totalRemoved,
      programStats
    });
  } catch (error) {
    console.error("Error fetching waitlist stats:", error);
    res.status(500).json({ error: "Failed to fetch waitlist statistics" });
  }
});

export default router; 