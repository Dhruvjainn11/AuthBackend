const Joi = require("joi");

const updateUserRoleSchema = Joi.object({
  role: Joi.string().trim().min(2).max(30).required()
});

const updateUserAccountStatusSchema = Joi.object({
  status: Joi.string()
    .valid('active', 'suspended', 'deleted')
    .required()
});

module.exports = {
  updateUserRoleSchema,
  updateUserAccountStatusSchema
};
