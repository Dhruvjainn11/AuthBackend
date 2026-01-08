const pool = require("../config/mysql");
const AppError = require("../utils/appError");

const updateUserRole = async ({ targetUserId, roleName, adminId }) => {
  if (targetUserId === adminId) {
    throw new AppError("Admin cannot change own role", 400);
  }

  // check role exists
  const [roleRows] = await pool.query("SELECT id FROM roles WHERE name = ?", [
    roleName,
  ]);

  if (!roleRows.length) {
    throw new AppError("Invalid role", 400);
  }

  const roleId = roleRows[0].id;

  // check user exists
  const [rows] = await pool.query(
    "SELECT id, account_status FROM users WHERE id = ?",
    [targetUserId]
  );

  if (!rows.length) {
    throw new AppError("User not found", 404);
  }
  if (rows[0].account_status === "deleted") {
    throw new AppError("Cannot change role of deleted user", 400);
  }

  // update role
  await pool.query("UPDATE users SET role_id = ? WHERE id = ?", [
    roleId,
    targetUserId,
  ]);
};

const updateUserAccountStatusService = async ({
  adminId,
  targetUserId,
  status,
}) => {
  // 1️ Validate status
  if (!["active", "suspended", "deleted"].includes(status)) {
    throw new AppError("Invalid account status", 400);
  }

  // 2️ Prevent admin acting on self
  if (adminId === targetUserId) {
    throw new AppError("Admin cannot change own account status", 400);
  }

  // 3️ Check user exists
  const [rows] = await pool.query("SELECT id FROM users WHERE id = ?", [
    targetUserId,
  ]);

  if (!rows.length) {
    throw new AppError("User not found", 404);
  }

  // 4️ Map status → DB fields
  let isActive;
  let accountStatus = status;
  let deletedAt = null;

  switch (status) {
    case "active":
      isActive = true;
      break;

    case "suspended":
      isActive = false;
      break;

    case "deleted":
      isActive = false;
      deletedAt = new Date();
      break;
  }

  // 5️ Update user
  await pool.query(
    `
    UPDATE users
    SET is_active = ?,
        account_status = ?,
        deleted_at = ?
    WHERE id = ?
    `,
    [isActive, accountStatus, deletedAt, targetUserId]
  );
};
module.exports = {
  updateUserRole,
  updateUserAccountStatusService,
};
