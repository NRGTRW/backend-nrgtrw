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
