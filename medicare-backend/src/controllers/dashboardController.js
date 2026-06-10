const { User, Doctor, Patient, Appointment, Prescription } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.count();
    const totalDoctors = await Doctor.count();
    const totalAppointments = await Appointment.count();

    const today = getDateString();

    const appointmentsToday = await Appointment.count({
      where: { appointment_date: today }
    });

    const pendingAppointments = await Appointment.count({
      where: { status: 'scheduled' }
    });

    const completedAppointments = await Appointment.count({
      where: { status: 'completed' }
    });

    const totalPrescriptions = await Prescription.count();

    const activePrescriptions = await Prescription.count({
      where: { status: 'issued' }
    });

    return successResponse(res, {
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsToday,
      pendingAppointments,
      completedAppointments,
      totalPrescriptions,
      activePrescriptions
    }, 'Dashboard stats retrieved.');
  } catch (err) {
    next(err);
  }
};

const getAppointmentsToday = async (req, res, next) => {
  try {
    const today = getDateString();

    const appointments = await Appointment.findAll({
      where: { appointment_date: today },
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'patient_number'] },
        { model: Doctor, as: 'doctor', attributes: ['id', 'specialization'],
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        }
      ],
      order: [['start_time', 'ASC']]
    });

    return successResponse(res, { appointments }, 'Today\'s appointments retrieved.');
  } catch (err) {
    next(err);
  }
};

const getRecentPatients = async (req, res, next) => {
  try {
    const patients = await Patient.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    return successResponse(res, { patients }, 'Recent patients retrieved.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getAppointmentsToday, getRecentPatients };
