const pool = require("../config/mysql");
const AppError = require('../utils/appError');
const fs = require("fs");
const path = require("path");

const getAllUserService = async() => {
  const [rows] = await pool.query(`SELECT 
  u.id,
  u.name,
  u.email,
  u.account_status,
  r.name AS role
FROM users u 
JOIN roles r ON r.id = u.role_id
where account_status != "deleted"`);

  if (rows.length === 0) {
    throw new AppError(" No User found", 404);
  }

  return rows;
 
};

const getProfileService = async (userId) => {
  const [rows] = await pool.query(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      u.avatar,
      u.account_status,
      u.is_active,
      u.last_login_at,
      u.created_at,
      r.name AS role
    FROM users u
    INNER JOIN roles r ON r.id = u.role_id
    WHERE u.id = ?
    LIMIT 1
    `,
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError("User not found", 404);
  }

  const user =  rows[0];

  return{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.account_status,
        avatar: user.avatar,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at
  }
};

const updateUserService = async (userId, payload) => {
  const { name, email, avatar } = payload;

  // 1️ Get existing user (for validation + old avatar)
  const [rows] = await pool.query(
    "SELECT avatar FROM users WHERE id = ?",
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError("User not found", 404);
  }

  const oldAvatar = rows[0].avatar;

  // 2️ Email uniqueness check (ONLY if email provided)
  if (email) {
    const [existingEmail] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );

    if (existingEmail.length > 0) {
      throw new AppError("Email already in use", 409);
    }
  }

  // 3️ Build dynamic update query
  const fields = [];
  const values = [];

  if (name) {
    fields.push("name = ?");
    values.push(name);
  }

  if (email) {
    fields.push("email = ?");
    values.push(email.toLowerCase());
  }

  if (avatar) {
    fields.push("avatar = ?");
    values.push(avatar);
  }

  if (fields.length === 0) {
    throw new AppError("No data provided for update", 400);
  }

  values.push(userId);

  // 4️ Update user
  const [result] = await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    throw new AppError("Profile update failed", 500);
  }

  const[userRows] = await pool.query(
    ` SELECT
      u.id,
      u.name,
      u.email,
      u.avatar,
      u.account_status,
      u.is_active      
    FROM users u
    WHERE u.id = ?
    `,
    [userId]
  );
  const user = userRows[0];

  // 5️ Delete old avatar AFTER successful DB update
  if (avatar && oldAvatar) {
    const oldAvatarPath = path.join(__dirname, "../../", oldAvatar);

    if (fs.existsSync(oldAvatarPath)) {
      fs.unlink(oldAvatarPath, (err) => {
        if (err) {
          console.error("Failed to delete old avatar:", err);
        }
      });
    }
  }

  return {
   id: user.id,
    name: user.name,
    email: user.email,
    status: user.account_status,
    avatar: user.avatar,
  };
};  

const removeUserAvatarService = async (userId) => {

  // 1️ Get existing avatar
  const [rows] = await pool.query(
    'SELECT avatar FROM users WHERE id = ?',
    [userId]
  );

  if (!rows.length) {
    throw new AppError('User not found', 404);
  }

  const avatar = rows[0].avatar;

  // 2️ If no avatar, exit silently (idempotent)
  if (!avatar) {
    return;
  }

  // 3️ Delete file from disk
  const avatarPath = path.join(__dirname, '../../', avatar);

  if (fs.existsSync(avatarPath)) {
    fs.unlinkSync(avatarPath);
  }

  // 4️ Update DB
  await pool.query(
    'UPDATE users SET avatar = NULL WHERE id = ?',
    [userId]
  );
};

module.exports = {
  getAllUserService,
  getProfileService,
  updateUserService,
  removeUserAvatarService
};
