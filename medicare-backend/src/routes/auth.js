const express = require('express');
const router = express.Router();
const Joi = require('joi');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

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

module.exports = router;
