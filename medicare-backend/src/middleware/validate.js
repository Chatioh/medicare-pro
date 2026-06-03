const apiResponse = require('../utils/apiResponse');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return apiResponse.error(res, 'Validation failed.', 400, errors);
    }

    req.body = value;
    next();
  };
};

module.exports = validate;
