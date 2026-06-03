const { Appointment, Doctor } = require('../models');
const { Op } = require('sequelize');

const checkConflicts = async (doctorId, appointmentDate, startTime, endTime, excludeAppointmentId = null) => {
  const whereClause = {
    doctor_id: doctorId,
    appointment_date: appointmentDate,
    status: { [Op.notIn]: ['cancelled', 'no_show'] },
    [Op.or]: [
      { start_time: { [Op.lt]: endTime }, end_time: { [Op.gt]: startTime } }
    ]
  };

  if (excludeAppointmentId) {
    whereClause.id = { [Op.ne]: excludeAppointmentId };
  }

  const conflicting = await Appointment.findOne({ where: whereClause });

  return {
    hasConflict: !!conflicting,
    conflictingAppointment: conflicting
  };
};

const checkDoctorAvailability = async (doctorId, appointmentDate) => {
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) return { available: false, reason: 'Doctor not found.' };

  const dayName = new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  if (doctor.available_days) {
    const days = doctor.available_days.split(',').map((d) => d.trim().toLowerCase());
    if (!days.includes(dayName)) {
      return { available: false, reason: `Doctor not available on ${dayName}s.` };
    }
  }

  return { available: true };
};

module.exports = { checkConflicts, checkDoctorAvailability };
