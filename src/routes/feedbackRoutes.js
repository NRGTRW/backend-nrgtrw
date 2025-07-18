import express from 'express';
import prisma from '../prisma/client.js';

const router = express.Router();

// Submit feedback (public endpoint)
router.post('/', async (req, res) => {
  // Debug: Log key environment variables
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  try {
    const { type, message, email } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type and message are required'
      });
    }

    const feedback = await prisma.feedback.create({
      data: {
        type,
        message,
        email: email || null,
        status: 'new'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    // Debug: Log full error stack
    console.error('Error submitting feedback:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Get all feedback (admin only)
router.get('/admin', async (req, res) => {
  try {
    const feedback = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
});

// Update feedback status (admin only)
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const feedback = await prisma.feedback.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status'
    });
  }
});

// Delete feedback (admin only)
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.feedback.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
});

export default router; 