import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/authMiddleware.js";
import { authAndAdminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/waitlist/join - Join the fitness program waitlist
router.post("/join", async (req, res) => {
  try {
    const { email, name, phone, message, programId } = req.body;
    
    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({ error: "Email and name are required" });
    }

    // Check if email is already on the waitlist for ANY program
    const duplicateEmail = await prisma.fitnessWaitlist.findFirst({
      where: { email }
    });
    if (duplicateEmail) {
      return res.status(400).json({ error: "This email is already on the waitlist for a program. Please use a different email or check your status." });
    }

    // Check if user is already on the waitlist for this program
    const existingEntry = await prisma.fitnessWaitlist.findUnique({
      where: {
        email_programId: {
          email,
          programId: programId || null
        }
      }
    });

    if (existingEntry) {
      return res.status(400).json({ error: "You are already on the waitlist for this program" });
    }

    // Get user ID if user is logged in
    let userId = null;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        // You might want to verify the token here and get user ID
        // For now, we'll create the entry without user ID
      } catch (error) {
        console.log("No valid auth token, creating anonymous waitlist entry");
      }
    }

    // Create waitlist entry
    const waitlistEntry = await prisma.fitnessWaitlist.create({
      data: {
        email,
        name,
        phone: phone || null,
        message: message || null,
        programId: programId || null,
        userId: userId || null,
        status: "WAITING"
      }
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
router.get("/status", protect, async (req, res) => {
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
    const { email, programId } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const waitlistEntry = await prisma.fitnessWaitlist.findUnique({
      where: {
        email_programId: {
          email,
          programId: programId || null
        }
      }
    });

    res.json({ 
      isOnWaitlist: !!waitlistEntry,
      entry: waitlistEntry 
    });
  } catch (error) {
    console.error("Error checking waitlist status:", error);
    res.status(500).json({ error: "Failed to check waitlist status" });
  }
});

// ========== ADMIN ROUTES ==========

// GET /api/waitlist/admin - Get all waitlist entries (admin only)
router.get("/admin", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
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
router.patch("/admin/:id", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
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
router.delete("/admin/:id", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
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
router.get("/admin/stats", authAndAdminMiddleware(["ADMIN", "ROOT_ADMIN"]), async (req, res) => {
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