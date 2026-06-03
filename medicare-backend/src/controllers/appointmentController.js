const { Appointment, Patient, Doctor, User } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { checkConflicts, checkDoctorAvailability } = require('../services/conflictService');

const getAllAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.date) where.appointment_date = req.query.date;
    if (req.query.doctor_id) where.doctor_id = req.query.doctor_id;
    if (req.query.patient_id) where.patient_id = req.query.patient_id;

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.userId } });
      if (doctor) where.doctor_id = doctor.id;
    }

    const { rows, count } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'patient_number'] },
        { model: Doctor, as: 'doctor', attributes: ['id', 'specialization'],
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        }
      ],
      limit,
      offset,
      order: [['appointment_date', 'DESC'], ['start_time', 'ASC']]
    });

    return successResponse(res, {
      appointments: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }, 'Appointments retrieved.');
  } catch (err) {
    next(err);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_date, start_time, end_time, type, reason } = req.body;

    const availability = await checkDoctorAvailability(doctor_id, appointment_date);
    if (!availability.available) {
      return errorResponse(res, availability.reason, 409);
    }

    const conflict = await checkConflicts(doctor_id, appointment_date, start_time, end_time);
    if (conflict.hasConflict) {
      return errorResponse(res, 'Doctor already has an appointment during this time.', 409);
    }

    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      appointment_date,
      start_time,
      end_time,
      type,
      reason,
      created_by: req.user.userId
    });

    return successResponse(res, { appointment }, 'Appointment created.', 201);
  } catch (err) {
    next(err);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        }
      ]
    });

    if (!appointment) return errorResponse(res, 'Appointment not found.', 404);

    return successResponse(res, { appointment }, 'Appointment retrieved.');
  } catch (err) {
    next(err);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return errorResponse(res, 'Appointment not found.', 404);

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.userId } });
      if (!doctor || appointment.doctor_id !== doctor.id) {
        return errorResponse(res, 'Forbidden. You can only update your own appointments.', 403);
      }
    }

    const allowedFields = ['status', 'notes', 'reason'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.start_time || updates.end_time || updates.appointment_date) {
      const date = updates.appointment_date || appointment.appointment_date;
      const start = updates.start_time || appointment.start_time;
      const end = updates.end_time || appointment.end_time;

      const conflict = await checkConflicts(appointment.doctor_id, date, start, end, appointment.id);
      if (conflict.hasConflict) {
        return errorResponse(res, 'Time slot conflicts with another appointment.', 409);
      }
    }

    await appointment.update(updates);

    return successResponse(res, { appointment }, 'Appointment updated.');
  } catch (err) {
    next(err);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return errorResponse(res, 'Appointment not found.', 404);

    await appointment.update({ status: 'cancelled' });

    return successResponse(res, { appointment }, 'Appointment cancelled.');
  } catch (err) {
    next(err);
  }
};

const checkConflict = async (req, res, next) => {
  try {
    const { doctor_id, date, start_time, end_time } = req.query;

    if (!doctor_id || !date || !start_time || !end_time) {
      return errorResponse(res, 'doctor_id, date, start_time, and end_time are required.', 400);
    }

    const result = await checkConflicts(doctor_id, date, start_time, end_time);

    return successResponse(res, {
      available: !result.hasConflict,
      conflictingAppointment: result.conflictingAppointment
    }, 'Conflict check completed.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllAppointments, createAppointment, getAppointmentById, updateAppointment, cancelAppointment, checkConflict };
