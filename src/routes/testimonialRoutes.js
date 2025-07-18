import express from "express";
import { authenticate, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial
} from "../controllers/testimonialController.js";

const router = express.Router();

// POST /api/testimonials - Create a new testimonial
router.post("/", authenticate, createTestimonial);

// GET /api/testimonials - Get all approved testimonials
router.get("/", getTestimonials);

// PUT /api/testimonials/:id - Update testimonial (admin only)
router.put("/:id", authenticate, requireAdmin, updateTestimonial);

// DELETE /api/testimonials/:id - Delete testimonial (admin only)
router.delete("/:id", authenticate, requireAdmin, deleteTestimonial);

// PUT /api/testimonials/:id/approve - Approve testimonial (admin only)
router.put("/:id/approve", authenticate, requireAdmin, approveTestimonial);

export default router; 