const express = require("express");
const router = express.Router();

const {authMiddleware} = require("../middlewares/authMiddleware");
const uploadAvatarMiddleware = require('../middlewares/uploadMiddleware')
const {getProfileController,updateProfileController, removeUserAvatarController} = require("../controllers/userController");
const validate = require("../middlewares/validateMiddleware");

const { updateProfileSchema } = require("../validations/userValidation");


router.get("/profile", authMiddleware, getProfileController);
router.patch("/profile", authMiddleware,  uploadAvatarMiddleware.single("avatar"), validate(updateProfileSchema),updateProfileController);
router.delete("/profile/avatar", authMiddleware, removeUserAvatarController);

module.exports = router;
