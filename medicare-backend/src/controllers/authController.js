const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const apiResponse = require('../utils/apiResponse');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

const register = async (req, res, next) => {
  try {
    const { full_name, email, password, role } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return apiResponse.errorResponse(res, 'Email already registered.', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({ full_name, email, password_hash, role });

    return apiResponse.successResponse(res, {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        createdAt: user.createdAt
      }
    }, 'User registered successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return apiResponse.errorResponse(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return apiResponse.errorResponse(res, 'Invalid email or password.', 401);
    }

    if (!user.is_active) {
      return apiResponse.errorResponse(res, 'Account is deactivated.', 403);
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });

    return apiResponse.successResponse(res, {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      }
    }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    return apiResponse.successResponse(res, null, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return apiResponse.errorResponse(res, 'User not found.', 404);
    }

    return apiResponse.successResponse(res, { user }, 'User profile retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
