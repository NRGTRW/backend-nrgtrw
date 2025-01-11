import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorMessage =
    err.message || "An unexpected error occurred on the server.";

  // Log detailed error for debugging
  logger.error(`Error: ${errorMessage}`);
  logger.error(err.stack);

  // Send response to client
  res.status(statusCode).json({
    error: errorMessage,
    details: process.env.NODE_ENV === "production" ? undefined : err.stack // Only show stack trace in non-production environments
  });
};

export default errorMiddleware;
