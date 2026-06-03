const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(authenticate);

router.get('/', doctorController.getAllDoctors);
router.post('/', authorize('admin'), doctorController.createDoctor);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id', authorize('admin', 'doctor'), doctorController.updateDoctor);
router.get('/:id/availability', doctorController.getDoctorAvailability);

module.exports = router;
