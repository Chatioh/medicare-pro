const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(authenticate);

router.get('/', appointmentController.getAllAppointments);
router.post('/', authorize('admin', 'receptionist'), appointmentController.createAppointment);
router.get('/check-conflict', appointmentController.checkConflict);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', authorize('admin', 'receptionist'), appointmentController.cancelAppointment);

module.exports = router;
