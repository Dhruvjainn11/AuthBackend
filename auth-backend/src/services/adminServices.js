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

const upsertRoleService = async (payload) => {
  const { id, name, description, is_active } = payload;

  // UPDATE ROLE

  if (id) {
    const [result] = await pool.query(
      `
      UPDATE roles
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
      `,
      [name, description, is_active, id]
    );

    if (result.affectedRows === 0) {
      throw new AppError("Role not found", 404);
    }

    return {
      id,
      action: "updated"
    };
  }

  // --------------------
  // CREATE ROLE
  // --------------------
  const [existing] = await pool.query(
    "SELECT id FROM roles WHERE name = ? LIMIT 1",
    [name]
  );

  if (existing.length > 0) {
    throw new AppError("Role already exists", 409);
  }

  const [result] = await pool.query(
    `
    INSERT INTO roles (name, description, is_active)
    VALUES (?, ?, ?)
    `,
    [name, description || null, is_active ?? 1]
  );

  return {
    id: result.insertId,
    action: "created"
  };
};


const deleteRoleService = async (roleId) => {
  // 1️⃣ Check role exists
  const [[role]] = await pool.query(
    "SELECT id, name FROM roles WHERE id = ? LIMIT 1",
    [roleId]
  );

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  // 2️⃣ Protect system roles
  if (role.name === "admin") {
    throw new AppError("Admin role cannot be deleted", 403);
  }

  // 3️⃣ Check if role is assigned to users
  const [[usage]] = await pool.query(
    "SELECT COUNT(*) AS count FROM users WHERE role_id = ?",
    [roleId]
  );

  if (usage.count > 0) {
    throw new AppError(
      "Role is assigned to users and cannot be deleted",
      409
    );
  }

  // 4️⃣ Soft delete (deactivate)
  await pool.query(
    "UPDATE roles SET is_active = false WHERE id = ?",
    [roleId]
  );

  return {
    id: roleId,
    action: "deleted"
  };
};


module.exports = {
  updateUserRole,
  updateUserAccountStatusService,
  upsertRoleService,
  deleteRoleService,
};
