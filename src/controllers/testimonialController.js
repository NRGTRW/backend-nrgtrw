import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { content, rating } = req.body;
    const userId = req.user.id;

    const testimonial = await prisma.testimonial.create({
      data: {
        userId,
        content,
        rating: rating || 5,
        isApproved: false
      },
      include: {
        user: {
          select: {
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: testimonial,
      message: "Testimonial submitted successfully and awaiting approval"
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
};

// Get testimonials (approved only for public, all for admin)
export const getTestimonials = async (req, res) => {
  try {
    const { approved } = req.query;
    const isAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'ROOT_ADMIN';

    const where = {};
    if (!isAdmin || approved === 'true') {
      where.isApproved = true;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
};

// Update testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;

    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: {
        content,
        rating
      },
      include: {
        user: {
          select: {
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: testimonial,
      message: "Testimonial updated successfully"
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).json({ error: "Failed to update testimonial" });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.testimonial.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: "Testimonial deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
};

// Approve testimonial
export const approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.update({
      where: { id: parseInt(id) },
      data: { isApproved: true },
      include: {
        user: {
          select: {
            name: true,
            profilePicture: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: testimonial,
      message: "Testimonial approved successfully"
    });
  } catch (error) {
    console.error("Error approving testimonial:", error);
    res.status(500).json({ error: "Failed to approve testimonial" });
  }
}; 