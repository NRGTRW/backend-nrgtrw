/* eslint-disable no-unused-vars */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
};
