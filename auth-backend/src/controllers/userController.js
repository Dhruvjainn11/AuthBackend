const {sendSuccess} = require("../common/response");
const { get } = require("../routes");
const {getAllUserService,updateUserService, removeUserAvatarService, getProfileService} = require("../services/userServices");
const AppError = require("../utils/appError");
const buildAssetUrl = require("../config/app");

const getUsercontroller = async (req, res, next) => {
  try {
    const data = await getAllUserService();
    return sendSuccess(res, "Users fetched successfully", data, 200);
  } catch (err) {
    next(err);
  }
};

const getProfileController = async (req, res) => {
      const data = await getProfileService(req.user.userId)
     
       const responseData = {
      ...data,
      avatar: buildAssetUrl(data.avatar)
    }; 
      
     return sendSuccess(res, "Profile fetched successfully", responseData, 200);
 
};

const updateProfileController = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const updateData = {
      name: req.body.name,
      email: req.body.email,
      avatar: req.file
        ? `/uploads/avatars/${req.file.filename}`
        : null,
    };

    const data = await updateUserService(userId, updateData);

    const responseData = {
      ...data,
      avatar: buildAssetUrl(data.avatar)
    }; 

    return sendSuccess(
      res,
      "Profile updated successfully",
      responseData,
      200
    );
  } catch (err) {
    next(err);
  }
};

const removeUserAvatarController = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await removeUserAvatarService(userId);

    return sendSuccess(res, "Avatar removed successfully", null, 200);
  } catch (err) {
    next(err);
  }
};


module.exports = {
  getUsercontroller,
  getProfileController,
  updateProfileController,
  removeUserAvatarController,
};
