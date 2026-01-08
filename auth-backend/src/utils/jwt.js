const jwt = require("jsonwebtoken");
const AppError = require("./appError");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

if (!JWT_SECRET) {
  throw new AppError("JWT_SECRET is missing",500);
}

if (!JWT_EXPIRES_IN) {
  throw new AppError("JWT_EXPIRES_IN is missing",500);
}

const signToken = (payload) => {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Payload is required to sign JWT",400);
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  if (!token) {
    throw new AppError("Token is required for verification",401);
  }

  return jwt.verify(token, JWT_SECRET);
};


module.exports = {
  signToken,
  verifyToken,
};
