const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { Op } = require('sequelize');
const { User } = require('../models');

const registerSchema = Joi.object({
  full_name: Joi.string().required().messages({
    'string.empty': 'Full name is required.'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'A valid email is required.',
    'string.empty': 'Email is required.'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters.',
    'string.empty': 'Password is required.'
  }),
  role: Joi.string().valid('admin', 'doctor', 'nurse', 'receptionist').required().messages({
    'any.only': 'Role must be one of: admin, doctor, nurse, receptionist.',
    'string.empty': 'Role is required.'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'A valid email is required.',
    'string.empty': 'Email is required.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required.'
  })
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

// GET /api/auth/staff — get all staff (admin only)
router.get('/staff', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    const staff = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['createdAt', 'DESC']]
    });
    return res.json({ success: true, data: staff, message: 'Staff retrieved successfully' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/staff/:id/toggle-status — activate/deactivate staff (admin only)
router.patch('/staff/:id/toggle-status', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Staff member not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate an admin account' });

    await user.update({ is_active: !user.is_active });

    return res.json({
      success: true,
      data: { ...user.toJSON(), password_hash: undefined },
      message: `Staff member ${user.is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/staff/:id/reset-password — reset password (admin only)
router.patch('/staff/:id/reset-password', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Staff member not found' });

    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash });

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
