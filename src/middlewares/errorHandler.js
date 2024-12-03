export function errorHandler(err, req, res, _next) {
  const { statusCode = 500, name = "Error", message = "Unknown Error" } = err;

  res.status(statusCode).json({
    isSuccessful: false,
    errors: [{ name, message }],
  });
}
