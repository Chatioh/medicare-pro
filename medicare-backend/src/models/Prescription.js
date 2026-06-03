const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  prescription_number: {
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
  appointment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('issued', 'dispensed', 'expired', 'cancelled'),
    allowNull: false,
    defaultValue: 'issued'
  },
  issued_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'prescriptions',
  timestamps: false
});

Prescription.beforeCreate(async (prescription) => {
  if (!prescription.id) {
    prescription.id = uuidv4();
  }
  if (!prescription.prescription_number) {
    const year = new Date().getFullYear();
    const count = await Prescription.count() + 1;
    prescription.prescription_number = `RX-${year}-${String(count).padStart(4, '0')}`;
  }
});

module.exports = Prescription;
