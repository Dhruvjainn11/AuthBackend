const { sendError } = require("../common/response");

const errorMiddleware = (err, req, res, next) => {
  console.log("ERROR 👉", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  return sendError(res, message, statusCode);
};

module.exports = errorMiddleware;