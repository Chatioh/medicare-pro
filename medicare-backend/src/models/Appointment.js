const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  appointment_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  type: {
    type: DataTypes.ENUM('consultation', 'follow_up', 'emergency', 'routine_checkup'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'appointments',
  timestamps: true
});

Appointment.beforeCreate(async (appointment) => {
  if (!appointment.id) {
    appointment.id = uuidv4();
  }
  if (!appointment.appointment_number) {
    const year = new Date().getFullYear();
    const count = await Appointment.count() + 1;
    appointment.appointment_number = `APT-${year}-${String(count).padStart(4, '0')}`;
  }
});

module.exports = Appointment;
