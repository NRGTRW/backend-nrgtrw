import { CustomError } from "../errors/index.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const { statusCode, name, message } =
    err instanceof CustomError
      ? err
      : {
          statusCode: 500,
          name: err?.name ?? "Error",
          message: err.message ?? "Unknown Error"
        };

  res.status(statusCode).send({
    isSuccessful: false,
    errors: [{ name, message }]
  });
}
