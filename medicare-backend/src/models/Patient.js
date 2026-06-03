const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  patient_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  blood_group: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergency_contact_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergency_contact_phone: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'patients',
  timestamps: true
});

Patient.beforeCreate(async (patient) => {
  if (!patient.id) {
    patient.id = uuidv4();
  }
  if (!patient.patient_number) {
    const year = new Date().getFullYear();
    const count = await Patient.count() + 1;
    patient.patient_number = `PAT-${year}-${String(count).padStart(4, '0')}`;
  }
});

module.exports = Patient;
