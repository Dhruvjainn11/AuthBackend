const express = require("express");
const router = express.Router();

const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  updateUserRoleController,
  updateUserAccountStatusController,
  upsertRoleController,
  deleteRoleController
} = require("../controllers/adminController");
const {
  updateUserRoleSchema,
  updateUserAccountStatusSchema,
  
} = require("../validations/adminValidation");
const { upsertRoleSchema } = require("../validations/roleValidation");
const { getUsercontroller } = require("../controllers/userController");

router.use(authMiddleware);
router.use(restrictTo("admin"));

router.get("/user", getUsercontroller);
router.get("/test", (req, res) => {
  res.json({ message: "Admin access granted" });
});
router.patch(
  "/users/:id/role",
  validate(updateUserRoleSchema),
  updateUserRoleController
);
router.patch(
  "/users/:id/status",
  validate(updateUserAccountStatusSchema),
  updateUserAccountStatusController
);
router.post(
  "/roles",
  validate(upsertRoleSchema),
  upsertRoleController
);
router.delete(
  "/roles/:id",
  deleteRoleController
);

module.exports = router;
