import rateLimit from 'express-rate-limit';

// In-memory store for banned IPs (for production, use Redis or DB)
const bannedIPs = new Map();

function banIP(ip) {
  bannedIPs.set(ip, Date.now() + 24 * 60 * 60 * 1000); // Ban for 24h
}

function isIPBanned(ip) {
  const banUntil = bannedIPs.get(ip);
  if (!banUntil) return false;
  if (Date.now() > banUntil) {
    bannedIPs.delete(ip);
    return false;
  }
  return true;
}

// Middleware to check if IP is banned
export function checkIPBan(req, res, next) {
  const ip = req.ip;
  if (isIPBanned(ip)) {
    return res.status(429).json({ error: 'Too many invalid attempts. Try again in 24 hours.' });
  }
  next();
}

// Rate limiter for signup/reset-password
export const abuseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 requests per windowMs
  handler: (req, res) => {
    banIP(req.ip);
    res.status(429).json({ error: 'Too many invalid attempts. Try again in 24 hours.' });
  }
}); 