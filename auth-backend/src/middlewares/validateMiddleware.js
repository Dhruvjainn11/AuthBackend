const AppError = require("../utils/appError");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const isMultipart = req.is("multipart/form-data");
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,   // collect all errors
      stripUnknown: !isMultipart, // ✅ strict for JSON, relaxed for multipart
      allowUnknown: isMultipart,  // ✅ required for multipart
    });

    if (error) {
      const message = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new AppError(message, 400));
    }

    // replace request data with validated & sanitized data
    req[property] = value;
    next();
  };
};

module.exports = validate;
