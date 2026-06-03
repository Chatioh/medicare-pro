const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'Server Error', statusCode = 500, errors = []) => {
  const response = {
    success: false,
    message
  };
  if (errors && errors.length > 0) response.errors = errors;
  return res.status(statusCode).json(response);
};

const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return successResponse(res, data, message, statusCode);
};

const paginated = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

const error = (res, message = 'Server Error', statusCode = 500, errors = null) => {
  return errorResponse(res, message, statusCode, errors || []);
};

module.exports = { successResponse, errorResponse, success, paginated, error };
