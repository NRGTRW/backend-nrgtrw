import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
};

export default errorMiddleware;
