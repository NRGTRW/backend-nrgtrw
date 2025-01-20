import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage =
    err.message || "An unexpected error occurred on the server.";

  // Log detailed error for debugging
  logger.error(`[${req.method} ${req.originalUrl}] Error: ${errorMessage}`);
  logger.error(err.stack);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors // Specific validation error details
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "You are not authorized to access this resource."
    });
  }

  // Send generic error response
  res.status(statusCode).json({
    error: errorMessage,
    statusCode,
    timestamp: new Date().toISOString(),
    details:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.stack || err.details // Stack trace only in non-production
  });
};

export default errorMiddleware;
