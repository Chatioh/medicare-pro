const { Prescription, PrescriptionItem, Patient, Doctor, User, Appointment } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getAllPrescriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.patient_id) where.patient_id = req.query.patient_id;
    if (req.query.status) where.status = req.query.status;

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.userId } });
      if (doctor) where.doctor_id = doctor.id;
    }

    const { rows, count } = await Prescription.findAndCountAll({
      where,
      include: [
        { model: PrescriptionItem, as: 'items' },
        { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'patient_number'] },
        { model: Doctor, as: 'doctor', attributes: ['id', 'specialization'],
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        }
      ],
      limit,
      offset,
      order: [['issued_at', 'DESC']]
    });

    return successResponse(res, {
      prescriptions: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }, 'Prescriptions retrieved.');
  } catch (err) {
    next(err);
  }
};

const createPrescription = async (req, res, next) => {
  try {
    const { patient_id, doctor_id, appointment_id, diagnosis, items, notes, expires_at } = req.body;

    if (!items || items.length === 0) {
      return errorResponse(res, 'At least one medication item is required.', 400);
    }

    const doctorId = doctor_id || (await Doctor.findOne({ where: { user_id: req.user.userId } }))?.id;
    if (!doctorId) return errorResponse(res, 'Doctor profile not found.', 404);

    const year = new Date().getFullYear();
    const count = await Prescription.count() + 1;
    const prescription_number = `RX-${year}-${String(count).padStart(4, '0')}`;

    const prescription = await Prescription.create({
      patient_id,
      doctor_id: doctorId,
      appointment_id: appointment_id || null,
      diagnosis,
      notes,
      expires_at,
      prescription_number
    });

    const prescriptionItems = items.map((item) => ({
      prescription_id: prescription.id,
      medication_name: item.medication_name,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      quantity: item.quantity,
      instructions: item.instructions
    }));
    await PrescriptionItem.bulkCreate(prescriptionItems);

    const result = await Prescription.findByPk(prescription.id, {
      include: [
        { model: PrescriptionItem, as: 'items' },
        { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'patient_number'] },
        { model: Doctor, as: 'doctor', attributes: ['id', 'specialization'],
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        }
      ]
    });

    return successResponse(res, { prescription: result }, 'Prescription created.', 201);
  } catch (err) {
    next(err);
  }
};

const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [
        { model: PrescriptionItem, as: 'items' },
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['full_name'] }]
        },
        { model: Appointment, as: 'appointment' }
      ]
    });

    if (!prescription) return errorResponse(res, 'Prescription not found.', 404);

    return successResponse(res, { prescription }, 'Prescription retrieved.');
  } catch (err) {
    next(err);
  }
};

const dispensePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [
        { model: PrescriptionItem, as: 'items' },
        { model: Patient, as: 'patient', attributes: ['id', 'full_name', 'patient_number'] },
        { model: Doctor, as: 'doctor', attributes: ['id', 'specialization'] }
      ]
    });
    if (!prescription) return errorResponse(res, 'Prescription not found.', 404);

    if (prescription.status !== 'issued') {
      return errorResponse(res, 'Only issued prescriptions can be dispensed.', 400);
    }

    await prescription.update({ status: 'dispensed' });

    return successResponse(res, { prescription }, 'Prescription dispensed.');
  } catch (err) {
    next(err);
  }
};

const cancelPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) return errorResponse(res, 'Prescription not found.', 404);

    if (prescription.status !== 'issued') {
      return errorResponse(res, `Cannot cancel a prescription that is already ${prescription.status}.`, 400);
    }

    await prescription.update({ status: 'cancelled' });
    return successResponse(res, { prescription }, 'Prescription cancelled successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPrescriptions, createPrescription, getPrescriptionById, dispensePrescription, cancelPrescription };
