import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  let errorMessage = err.message || "An unexpected error occurred";

  // Handle AWS S3 errors specifically
  if (err.code === 'NoSuchBucket' || err.code === 'CredentialsError') {
    errorMessage = "Storage service unavailable";
    logger.error(`AWS Error: ${err.code} - ${err.message}`);
  }

  // Handle database connection errors
  if (err.message.includes('prisma') || err.message.includes('database')) {
    errorMessage = "Database connection error";
    statusCode = 503;
  }

  // Log detailed error
  logger.error(`[${req.method} ${req.originalUrl}] ${errorMessage}`);
  logger.error(err.stack);

  res.status(statusCode).json({
    error: errorMessage,
    statusCode,
    details: process.env.NODE_ENV === 'production' ? undefined : {
      stack: err.stack,
      type: err.name
    }
  });
};

export default errorMiddleware;