const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/appError");
const pool = require("../config/mysql");

const authMiddleware = async(req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized",401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);
    const userId = decoded.userId;

     const [rows] = await pool.query(
      `SELECT u.id, u.email, u.is_active, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [userId]
    );

    if (!rows.length) {
      return next(new AppError('User not found', 401));
    }

    if (!rows[0].is_active) {
  return next(new AppError('Account suspended', 403));
}

    req.user = {
      userId: rows[0].id,
      email: rows[0].email,
      role: rows[0].role
    };
   
    next();
  } catch (err) {
    next(err);
  }
};

const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden', 403));
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  restrictTo
}
