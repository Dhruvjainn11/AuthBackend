const { sendSuccess } = require("../common/response");
const {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
} = require("../services/authServices");
const buildAssetUrl = require("../config/app");

const registerController = async (req, res, next) => {
  try {
    const data = await registerService(req.body);
      const responseData = {
      ...data,
      avatar: buildAssetUrl(data.user.avatar)
    };
    return sendSuccess(res, "User registered successfully", responseData, 201);
  } catch (err) {
    next(err);
  }
};

const loginController = async (req, res, next) => {
  try {
    const data = await loginService(req.body);
    const responseData = {
      ...data,
      user: {
        ...data.user,
        avatar: buildAssetUrl(data.user.avatar)
      }
    };

    return sendSuccess(
      res,"Login successful",responseData,200);
  } catch (err) {
    next(err);
  }
};

const refreshTokenController = async (req, res, next) => {
  
  try {
    const refreshToken = req.cookies.refreshToken;

    const data = await refreshTokenService(refreshToken);

    return sendSuccess(
      res,
      "Access token refreshed",
      data,
      200
    );
  } catch (err) {
    next(err);
  }
};

const logoutController = async (req, res, next) => {
  try {
    
    const refreshToken = req.cookies.refreshToken;

    await logoutService(refreshToken);

    return sendSuccess(res, "Logged out successfully", null, 200);
  } catch (err) {
    next(err);
  }
};

const forgotPasswordController = async (req, res, next) => {
  try {
    const data = await forgotPasswordService(req.body);
    return sendSuccess(res, "Reset token generated", data, 200);
  } catch (err) {
    next(err);
  }
};

const resetPasswordController = async (req, res, next) => {
  try {
    await resetPasswordService(req.body);
    return sendSuccess(res,"Password reset successfully", null, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
};
