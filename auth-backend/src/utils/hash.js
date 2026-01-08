const bcrypt = require("bcrypt");
const AppError = require("./appError");

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);

if (!saltRounds) {
  throw new AppError("BCRYPT_SALT_ROUNDS is missing or invalid",400);
}

const hashPassword = async (password) => {

  return bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  
  return bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
