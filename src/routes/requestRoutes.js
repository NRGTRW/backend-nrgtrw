import express from 'express';
import {
  sendRequestEmail, // legacy, keep for now
  createRequest,
  getRequests,
  sendMessage,
  getMessages,
  adminUpdateRequestStatus,
  getUsers,
  adminBlockUser,
  getNotifications,
  markNotificationRead,
  adminDeleteRequest,
  markMessagesAsRead
} from '../controllers/requestController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Legacy email endpoint
router.post('/send-request', sendRequestEmail);

// Chat/Request system endpoints
router.post('/requests', (req, res, next) => {
  console.log('DEBUG: POST /api/requests route hit');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
}, authenticate, createRequest); // user creates a request

// 405 handler for unsupported methods on /requests
router.all('/requests', (req, res, next) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    console.warn(`405 Method Not Allowed: ${req.method} /api/requests`);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  next();
});
router.get('/requests', authenticate, getRequests); // admin: all, user: own
router.post('/requests/:id/messages', authenticate, sendMessage); // send message in a request thread
router.get('/requests/:id/messages', authenticate, getMessages); // get all messages for a request
router.patch('/requests/:id/messages/read', authenticate, markMessagesAsRead); // mark messages as read
router.patch('/requests/:id/status', authenticate, requireAdmin, adminUpdateRequestStatus); // admin: approve/reject/close
router.delete('/requests/:id', authenticate, requireAdmin, adminDeleteRequest);
router.get('/users', authenticate, requireAdmin, getUsers); // admin: list users
router.patch('/users/:id/block', authenticate, requireAdmin, adminBlockUser); // admin: block/unblock user
router.get('/notifications', authenticate, getNotifications); // get notifications for current user
router.patch('/notifications/:id/read', authenticate, markNotificationRead); // mark notification as read

console.log('requestRoutes loaded in production');

export default router; 