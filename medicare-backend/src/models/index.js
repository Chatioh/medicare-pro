const sequelize = require('../config/database');
const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const MedicalHistory = require('./MedicalHistory');
const Appointment = require('./Appointment');
const Prescription = require('./Prescription');
const PrescriptionItem = require('./PrescriptionItem');

// ─── User ↔ Doctor (One-to-One) ────────────────────────────
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ─── Patient ↔ MedicalHistory (One-to-One) ─────────────────
Patient.hasOne(MedicalHistory, { foreignKey: 'patient_id', as: 'medicalHistory' });
MedicalHistory.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// ─── Patient ↔ Appointments (One-to-Many) ──────────────────
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// ─── Doctor ↔ Appointments (One-to-Many) ───────────────────
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// ─── Patient ↔ Prescriptions (One-to-Many) ─────────────────
Patient.hasMany(Prescription, { foreignKey: 'patient_id', as: 'prescriptions' });
Prescription.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// ─── Doctor ↔ Prescriptions (One-to-Many) ──────────────────
Doctor.hasMany(Prescription, { foreignKey: 'doctor_id', as: 'prescriptions' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// ─── Appointment ↔ Prescriptions (One-to-Many) ─────────────
Appointment.hasMany(Prescription, { foreignKey: 'appointment_id', as: 'prescriptions' });
Prescription.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

// ─── Prescription ↔ PrescriptionItems (One-to-Many) ────────
Prescription.hasMany(PrescriptionItem, { foreignKey: 'prescription_id', as: 'items' });
PrescriptionItem.belongsTo(Prescription, { foreignKey: 'prescription_id', as: 'prescription' });

// ─── Sync all models to database ───────────────────────────
const syncDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Failed to sync database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Doctor,
  Patient,
  MedicalHistory,
  Appointment,
  Prescription,
  PrescriptionItem,
  syncDatabase
};
