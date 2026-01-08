const {
  updateUserRole,
  updateUserAccountStatusService,
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

module.exports = {
  updateUserRoleController,
  updateUserAccountStatusController,
};
