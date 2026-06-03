const { ValidationError, UniqueConstraintError } = require('sequelize');
const apiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message || err);

  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message
    }));
    return apiResponse.errorResponse(res, 'Validation error.', 400, errors);
  }

  if (err instanceof UniqueConstraintError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: `${e.path} already exists.`
    }));
    return apiResponse.errorResponse(res, 'Duplicate entry.', 409, errors);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    message
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
