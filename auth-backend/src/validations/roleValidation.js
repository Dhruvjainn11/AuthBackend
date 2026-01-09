const Joi = require("joi");

const upsertRoleSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .optional(),

  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional(),

  description: Joi.string()
    .trim()
    .min(5)
    .max(255)
    .optional(),

})
  // CREATE: id missing → name required
  .when(Joi.object({ id: Joi.exist() }).unknown(), {
    then: Joi.object({
      name: Joi.optional()
    })
  })
  .when(Joi.object({ id: Joi.not(Joi.exist()) }).unknown(), {
    then: Joi.object({
      name: Joi.required(),
      description: Joi.required()
    })
  })
  // UPDATE: must provide at least one field to update
  .min(1);

module.exports = { upsertRoleSchema };
