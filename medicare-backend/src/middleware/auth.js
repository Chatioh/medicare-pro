const jwt = require('jsonwebtoken');
const apiResponse = require('../utils/apiResponse');

const authenticate = (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return apiResponse.error(res, 'Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return apiResponse.error(res, 'Token expired.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return apiResponse.error(res, 'Invalid token.', 401);
    }
    return apiResponse.error(res, 'Authentication failed.', 401);
  }
};

module.exports = authenticate;
