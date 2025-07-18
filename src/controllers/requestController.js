import nodemailer from 'nodemailer';
import prisma from '../prisma/client.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendRequestEmail = async (req, res) => {
  const { name, email, projectType, description, timeline, budget, urgency, additionalInfo } = req.body;

  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Name, email, and description are required.' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'nrgtrwsales@gmail.com',
    subject: `New Project Request - ${projectType || 'General'}`,
    text: `A new project request has been submitted.\n\nClient Information:\n- Name: ${name}\n- Email: ${email}\n\nProject Details:\n- Project Type: ${projectType || 'Not specified'}\n- Description: ${description}\n- Timeline: ${timeline || 'Not specified'}\n- Budget Range: ${budget || 'Not specified'}\n- Urgency Level: ${urgency || 'medium'}\n\nAdditional Information:\n${additionalInfo || 'None provided'}\n\n---\nThis request was submitted through the NRG website.`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Request sent successfully!' });
  } catch (error) {
    console.error('Error sending request email:', error);
    res.status(500).json({ error: 'Failed to send request. Please try again later.' });
  }
};

// --- Chat/Request System Controllers ---
export const createRequest = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.id;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required.' });
  }
  try {
    const request = await prisma.request.create({
      data: {
        userId,
        title,
        description,
        status: 'pending',
      },
    });
    // Notify all active admins
    const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'ROOT_ADMIN'] } } });
    await Promise.all(admins.map(admin =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'new_request',
          content: `New request from ${req.user.name || 'a user'}: ${title}`,
        }
      })
    ));
    // Emit real-time event to all admins
    const io = req.app.get('io');
    admins.forEach(admin => {
      io.to(`user_${admin.id}`).emit('new_request', request);
    });
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request.' });
  }
};

export const getRequests = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  try {
    let requests;
    if (role === 'admin' || role === 'ADMIN' || role === 'ROOT_ADMIN') {
      requests = await prisma.request.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      requests = await prisma.request.findMany({
        where: { userId: Number(userId) },
        orderBy: { createdAt: 'desc' },
      });
    }
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

export const sendMessage = async (req, res) => {
  const { content, type } = req.body;
  const senderId = req.user.id;
  const { id: requestId } = req.params;
  if (!content || !requestId) {
    return res.status(400).json({ error: 'content and requestId are required.' });
  }
  try {
    // Only allow sending messages to requests the user owns or if admin
    const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (req.user.role !== 'admin' && req.user.role !== 'ADMIN' && req.user.role !== 'ROOT_ADMIN' && request.userId !== senderId) {
      return res.status(403).json({ error: 'Not authorized to message in this request.' });
    }
    const message = await prisma.message.create({
      data: {
        requestId: Number(requestId),
        senderId,
        content,
        type: type || 'text',
      },
    });
    // Notify all active admins (except sender if admin)
    const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'ROOT_ADMIN'] }, id: { not: senderId } } });
    await Promise.all(admins.map(admin =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'new_message',
          content: `New message in request #${requestId} from ${req.user.name || 'a user'}`,
        }
      })
    ));
    // If admin is replying, notify the request owner (if not the sender)
    if ((req.user.role === 'admin' || req.user.role === 'ADMIN') && request.userId !== senderId) {
      await prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'admin_reply',
          content: `Admin replied to your request: ${request.title}`,
        }
      });
    }
    // Emit real-time event to all participants
    const io = req.app.get('io');
    io.to(`user_${request.userId}`).emit('new_message', message);
    io.to(`user_${senderId}`).emit('new_message', message);
    admins.forEach(admin => {
      io.to(`user_${admin.id}`).emit('new_message', message);
    });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};

export const getMessages = async (req, res) => {
  const { id: requestId } = req.params;
  const userId = req.user.id;
  const role = req.user.role;
  if (!requestId) {
    return res.status(400).json({ error: 'requestId is required.' });
  }
  try {
    const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (role !== 'admin' && role !== 'ADMIN' && role !== 'ROOT_ADMIN' && request.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view messages for this request.' });
    }
    const messages = await prisma.message.findMany({
      where: { requestId: Number(requestId) },
      include: { sender: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

export const adminUpdateRequestStatus = async (req, res) => {
  const { status } = req.body;
  const { id: requestId } = req.params;
  if (!status || !requestId) {
    return res.status(400).json({ error: 'status and requestId are required.' });
  }
  try {
    const updated = await prisma.request.update({
      where: { id: Number(requestId) },
      data: { status },
    });
    // Notify the request owner
    await prisma.notification.create({
      data: {
        userId: updated.userId,
        type: 'status_update',
        content: `Your request "${updated.title}" status changed to: ${status}`,
      }
    });
    // Emit real-time event to request owner
    const io = req.app.get('io');
    io.to(`user_${updated.userId}`).emit('status_update', { requestId: updated.id, status });
    res.json(updated);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Failed to update request status.' });
  }
};

export const adminDeleteRequest = async (req, res) => {
  const { id: requestId } = req.params;
  if (!requestId) {
    return res.status(400).json({ error: 'requestId is required.' });
  }
  try {
    // Delete all messages related to the request
    await prisma.message.deleteMany({ where: { requestId: Number(requestId) } });
    // Delete all notifications related to the request
    await prisma.notification.deleteMany({ where: { content: { contains: String(requestId) } } });
    // Delete the request itself
    await prisma.request.delete({ where: { id: Number(requestId) } });
    res.json({ success: true, message: 'Request deleted successfully.' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request.' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

export const adminBlockUser = async (req, res) => {
  const { status } = req.body;
  const { id: userId } = req.params;
  if (!status || !userId) {
    return res.status(400).json({ error: 'status and userId are required.' });
  }
  try {
    const updated = await prisma.user.update({
      where: { id: Number(userId) },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
};

export const getNotifications = async (req, res) => {
  const userId = req.user.id;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};

export const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    await prisma.notification.updateMany({
      where: { id: Number(id), userId },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  const { id: requestId } = req.params;
  const { messageIds } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  if (!messageIds || !Array.isArray(messageIds)) {
    return res.status(400).json({ error: 'messageIds array is required.' });
  }

  try {
    // Verify user has access to this request
    const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    
    if (role !== 'admin' && role !== 'ADMIN' && role !== 'ROOT_ADMIN' && request.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to mark messages as read for this request.' });
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: { 
        id: { in: messageIds.map(id => Number(id)) },
        requestId: Number(requestId)
      },
      data: { read: true },
    });

    // Emit real-time event to notify other participants
    const io = req.app.get('io');
    const otherUserId = role === 'admin' || role === 'ADMIN' || role === 'ROOT_ADMIN' ? request.userId : null;
    
    if (otherUserId) {
      io.to(`user_${otherUserId}`).emit('message_read', { messageIds });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read.' });
  }
}; 