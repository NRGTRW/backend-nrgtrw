import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key_here");
    req.user = decoded; // Attach decoded user info to the request object
    next();
  } catch {
    res.status(401).json({ error: "Invalid token." });
  }
};

export default authMiddleware;
