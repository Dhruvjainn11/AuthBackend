const express = require('express')
const router = express.Router()
const {registerController, loginController, refreshTokenController, logoutController,forgotPasswordController, resetPasswordController} = require("../controllers/authController")
const validate = require("../middlewares/validateMiddleware")
const {registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema} = require("../validations/authValidation")

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema),loginController);
router.post("/refresh", refreshTokenController);
router.post("/logout",  logoutController);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordController);
router.post("/reset-password",  validate(resetPasswordSchema), resetPasswordController);



module.exports = router;