const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const MedicalHistory = sequelize.define('MedicalHistory', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  chronic_conditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  past_surgeries: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  current_medications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  family_history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'medical_histories',
  timestamps: true,
  createdAt: false
});

MedicalHistory.beforeCreate((history) => {
  if (!history.id) {
    history.id = uuidv4();
  }
});

module.exports = MedicalHistory;
