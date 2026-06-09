const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(authenticate);

router.get('/', authorize('doctor', 'admin', 'nurse'), prescriptionController.getAllPrescriptions);
router.post('/', authorize('doctor', 'admin'), prescriptionController.createPrescription);
router.get('/:id', prescriptionController.getPrescriptionById);
router.put('/:id/dispense', authorize('nurse', 'admin'), prescriptionController.dispensePrescription);

module.exports = router;
