const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(authenticate);

router.get('/', patientController.getAllPatients);
router.post('/', authorize('admin', 'receptionist'), patientController.createPatient);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', authorize('admin'), patientController.deletePatient);
router.get('/:id/history', authorize('doctor', 'nurse', 'admin'), patientController.getMedicalHistory);
router.put('/:id/history', authorize('doctor', 'admin'), patientController.updateMedicalHistory);

module.exports = router;
