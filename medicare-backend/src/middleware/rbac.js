const apiResponse = require('../utils/apiResponse');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, 'Authentication required.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return apiResponse.error(res, 'Forbidden. Insufficient permissions.', 403);
    }

    next();
  };
};

module.exports = authorize;
