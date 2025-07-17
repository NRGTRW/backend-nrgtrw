import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally fetch user from DB for fresh status/role
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = { id: user.id, role: user.role, status: user.status };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  const adminRoles = ['admin', 'ADMIN', 'ROOT_ADMIN'];
  if (!adminRoles.includes(req.user?.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
