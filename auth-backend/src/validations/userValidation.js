const Joi = require("joi");

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(30).optional().empty(""),
  email: Joi.string().email().optional().empty(""),
});

module.exports = {
  updateProfileSchema,
};
