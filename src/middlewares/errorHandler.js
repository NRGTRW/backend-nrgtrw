// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
  });
};