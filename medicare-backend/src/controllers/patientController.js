const { Patient, MedicalHistory } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateUUID, generatePatientNumber } = require('../utils/generateId');

const getAllPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) {
      const search = req.query.search;
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { patient_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows, count } = await Patient.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return successResponse(res, {
      patients: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }, 'Patients retrieved.');
  } catch (err) {
    next(err);
  }
};

const createPatient = async (req, res, next) => {
  try {
    const { full_name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact_name, emergency_contact_phone } = req.body;

    const patient = await Patient.create({
      id: generateUUID(),
      patient_number: generatePatientNumber(),
      full_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      blood_group,
      emergency_contact_name,
      emergency_contact_phone
    });

    await MedicalHistory.create({
      id: generateUUID(),
      patient_id: patient.id
    });

    return successResponse(res, { patient }, 'Patient created.', 201);
  } catch (err) {
    next(err);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: MedicalHistory, as: 'medicalHistory' }
      ]
    });

    if (!patient) return errorResponse(res, 'Patient not found.', 404);

    return successResponse(res, { patient }, 'Patient retrieved.');
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return errorResponse(res, 'Patient not found.', 404);

    const allowedFields = ['full_name', 'date_of_birth', 'gender', 'phone', 'email', 'address', 'blood_group', 'emergency_contact_name', 'emergency_contact_phone'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    await patient.update(updates);

    return successResponse(res, { patient }, 'Patient updated.');
  } catch (err) {
    next(err);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return errorResponse(res, 'Patient not found.', 404);

    await patient.destroy();

    return successResponse(res, null, 'Patient deleted.');
  } catch (err) {
    next(err);
  }
};

const getMedicalHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return errorResponse(res, 'Patient not found.', 404);

    const history = await MedicalHistory.findOne({
      where: { patient_id: req.params.id }
    });

    return successResponse(res, { medicalHistory: history }, 'Medical history retrieved.');
  } catch (err) {
    next(err);
  }
};

const updateMedicalHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return errorResponse(res, 'Patient not found.', 404);

    const allowedFields = ['chronic_conditions', 'allergies', 'past_surgeries', 'current_medications', 'family_history', 'notes'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    let history = await MedicalHistory.findOne({ where: { patient_id: req.params.id } });
    if (history) {
      await history.update(updates);
    } else {
      history = await MedicalHistory.create({
        id: generateUUID(),
        patient_id: req.params.id,
        ...updates
      });
    }

    return successResponse(res, { medicalHistory: history }, 'Medical history updated.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPatients, createPatient, getPatientById, updatePatient, deletePatient, getMedicalHistory, updateMedicalHistory };
