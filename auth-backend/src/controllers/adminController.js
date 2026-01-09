const {
  updateUserRole,
  updateUserAccountStatusService,
  upsertRoleService,
  deleteRoleService
} = require("../services/adminServices");
const { sendSuccess } = require("../common/response");

const updateUserRoleController = async (req, res, next) => {
  try {
    const targetUserId = Number(req.params.id);
    const { role } = req.body;
    const adminId = req.user.userId;

    await updateUserRole({
      targetUserId,
      roleName: role,
      adminId,
    });

    return sendSuccess(res, "User role updated successfully", null, 200);
  } catch (err) {
    next(err);
  }
};

const updateUserAccountStatusController = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const targetUserId = Number(req.params.id);
    const { status } = req.body;

    await updateUserAccountStatusService({
      adminId,
      targetUserId,
      status,
    });

    return sendSuccess(
      res,
      "User account status updated successfully",
      null,
      200
    );
  } catch (err) {
    next(err);
  }
};

const upsertRoleController = async (req, res, next) => {
  try {
    const result = await upsertRoleService(req.body);

    return sendSuccess(
      res,
      `Role ${result.action} successfully`,
      result,
      result.action === "created" ? 201 : 200
    );
  } catch (err) {
    next(err);
  }
};

const deleteRoleController = async (req, res, next) => {
  try {
    const roleId = Number(req.params.id);

    const result = await deleteRoleService(roleId);

    return sendSuccess(
      res,
      "Role deleted successfully",
      result,
      200
    );
  } catch (err) {
    next(err);
  }
};


module.exports = {
  updateUserRoleController,
  updateUserAccountStatusController,
  upsertRoleController,
  deleteRoleController,
};
