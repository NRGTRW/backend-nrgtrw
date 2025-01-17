export class CustomError extends Error {
  constructor(name, message, statusCode) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends CustomError {
  constructor(resource) {
    super(
      "Not Found",
      `The requested ${resource || "resource"} does not exist`,
      404
    );
  }
}

if (!process.env.PORT || !process.env.DATABASE_URL) {
  throw new Error("Missing essential environment variables. Check your .env file.");
}

