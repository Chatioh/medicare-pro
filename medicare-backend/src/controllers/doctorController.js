const { Doctor, User, Appointment } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { checkConflicts } = require('../services/conflictService');

const getAllDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) {
      const search = req.query.search;
      where[Op.or] = [
        { specialization: { [Op.like]: `%${search}%` } },
        { license_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows, count } = await Doctor.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'email'] }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, {
      doctors: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }, 'Doctors retrieved.');
  } catch (err) {
    next(err);
  }
};

const createDoctor = async (req, res, next) => {
  try {
    const { user_id, specialization, license_number, phone, bio, available_days, start_time, end_time } = req.body;

    const user = await User.findByPk(user_id);
    if (!user) return errorResponse(res, 'User not found.', 404);
    if (user.role !== 'doctor') return errorResponse(res, 'User must have role doctor.', 400);

    const existingLicense = await Doctor.findOne({ where: { license_number } });
    if (existingLicense) return errorResponse(res, 'License number already exists.', 409);

    const doctor = await Doctor.create({ user_id, specialization, license_number, phone, bio, available_days, start_time, end_time });

    return successResponse(res, { doctor }, 'Doctor created.', 201);
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'email'] }
      ]
    });

    if (!doctor) return errorResponse(res, 'Doctor not found.', 404);

    return successResponse(res, { doctor }, 'Doctor retrieved.');
  } catch (err) {
    next(err);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return errorResponse(res, 'Doctor not found.', 404);

    if (req.user.role === 'doctor' && doctor.user_id !== req.user.userId) {
      return errorResponse(res, 'Forbidden. You can only update your own profile.', 403);
    }

    const allowedFields = ['specialization', 'phone', 'bio', 'available_days', 'start_time', 'end_time'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await doctor.update(updates);

    if (req.body.full_name !== undefined) {
      const user = await User.findByPk(doctor.user_id);
      if (user) {
        await user.update({ full_name: req.body.full_name });
      }
    }

    const updatedDoctor = await Doctor.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'email'] }
      ]
    });

    return successResponse(res, { doctor: updatedDoctor }, 'Doctor updated.');
  } catch (err) {
    next(err);
  }
};

const getDoctorAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return errorResponse(res, 'Date query parameter is required.', 400);

    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return errorResponse(res, 'Doctor not found.', 404);

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const days = doctor.available_days ? doctor.available_days.split(',').map((d) => d.trim().toLowerCase()) : [];
    if (days.length > 0 && !days.includes(dayName)) {
      return successResponse(res, {
        available: false,
        reason: `Doctor not available on ${dayName}s.`,
        bookedSlots: []
      }, 'Availability checked.');
    }

    const appointments = await Appointment.findAll({
      where: {
        doctor_id: req.params.id,
        appointment_date: date,
        status: { [Op.in]: ['scheduled', 'confirmed'] }
      },
      attributes: ['start_time', 'end_time'],
      order: [['start_time', 'ASC']]
    });

    return successResponse(res, {
      available: true,
      workingHours: { start: doctor.start_time, end: doctor.end_time },
      bookedSlots: appointments
    }, 'Availability checked.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllDoctors, createDoctor, getDoctorById, updateDoctor, getDoctorAvailability };
