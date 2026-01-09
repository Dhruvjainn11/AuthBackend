const pool = require("../config/mysql");
const { hashPassword, comparePassword } = require("../utils/hash");
const { signToken } = require("../utils/jwt");
const AppError = require("../utils/appError");
const crypto = require("crypto");


const registerService = async (payload) => {
  const { name, email, password } = payload;

  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    throw new AppError('User already exists', 409);
  }

  const hashedPassword = await hashPassword(password);

  // 🔑 decide role
  const [[{ count }]] = await pool.query(
    'SELECT COUNT(*) AS count FROM users'
  );

  const roleName = count === 0 ? 'admin' : 'developer';


  const [roleRows] = await pool.query(
    'SELECT id FROM roles WHERE name = ?',
    [roleName]
  );
  console.log(roleRows);

  if (!roleRows.length) {
    throw new AppError('Role not found', 500);
  }

  const roleId = roleRows[0].id;
  const status = 'active';

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role_id, account_status) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, roleId, status]
  );

  const userId = result.insertId;

  return {
    id: userId,
    name,
    email,
    role: roleName,
    avatar: null
  };
};

const loginService = async (payload) => {
  const { email, password } = payload;

  const normalizedEmail = email.toLowerCase();

  const [rows] = await pool.query(
   ` SELECT 
  u.id,
  u.name,
  u.email,
  u.password,
  u.is_active,
  u.avatar,
  u.account_status,
  u.role_id,
  r.name AS role
FROM users u
INNER JOIN roles r ON r.id = u.role_id
WHERE u.email = ?
LIMIT 1`,
    [normalizedEmail]
  );

  if (rows.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }
  
  const user = rows[0];

  if (!user.is_active) {
  throw new AppError('Account suspended', 403);
}

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  await pool.query(
  'UPDATE users SET last_login_at = NOW() WHERE id = ?',
  [user.id]
);

  const accessToken = signToken({
    userId: user.id,
    email: user.email,
  });

  const refreshToken = crypto.randomBytes(32).toString("hex");

  const refreshTokenHash = crypto
  .createHash("sha256")
  .update(refreshToken)
  .digest("hex");

  const refreshTokenExpiry = new Date(
  Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
);

await pool.query(
  `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
   VALUES (?, ?, ?)`,
  [user.id, refreshTokenHash, refreshTokenExpiry]
);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,  
      status: user.account_status,    
      role:user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

const refreshTokenService = async (refreshToken) => {
  
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  // Hash incoming refresh token
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Find valid refresh token in DB
  const [rows] = await pool.query(
    `
    SELECT user_id
    FROM refresh_tokens
    WHERE token_hash = ?
      AND expires_at > NOW()
      AND revoked_at IS NULL
    `,
    [refreshTokenHash]
  );

  if (rows.length === 0) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const userId = rows[0].user_id;

    // ACCOUNT STATUS CHECK
  const [userRows] = await pool.query(
    `SELECT is_active FROM users WHERE id = ?`,
    [userId]
  );

  if (!userRows.length) {
    throw new AppError("User not found", 401);
  }

  if (!userRows[0].is_active) {
    throw new AppError("Account suspended", 403);
  }

  // Issue new access token
  const accessToken = signToken({ userId });

  return {
    accessToken,
  };
};

const logoutService = async (refreshToken) => {

  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  // Hash refresh token
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Revoke refresh token
  const [result] = await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = ?
      AND revoked_at IS NULL
    `,
    [refreshTokenHash]
  );

  // If no rows updated → token was invalid or already revoked
  if (result.affectedRows === 0) {
    throw new AppError("Invalid refresh token", 401);
  }

  return true;
};

const forgotPasswordService = async (payload) => {

  const { email } = payload;

  const normalizedEmail = email.toLowerCase();

  const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [
    normalizedEmail,
  ]);

  if (rows.length === 0) {
    throw new AppError("User Not Found", 404);
  }

  const user = rows[0];
  
  const [userRows] = await pool.query(
    `SELECT is_active FROM users WHERE id = ?`,
    [user.id]
  );
  const [status] = userRows;

  if (!status.is_active) {
    throw new AppError('Account suspended', 403);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await pool.query(
    "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?",
    [hashedToken, expiry, user.id]
  );

  return {
    resetToken
  };
};

const resetPasswordService = async (payload) => {
  const { token, newPassword } = payload;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const [rows] = await pool.query(
    "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
    [hashedToken, new Date()]
  );

  if (rows.length === 0) {
    throw new AppError("Invalid or expired token", 400);
  }

  const user = rows[0];

  const hashedPassword = await hashPassword(newPassword);

  await pool.query(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
    [hashedPassword, user.id]
  );

};

module.exports = {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  resetPasswordService
};
