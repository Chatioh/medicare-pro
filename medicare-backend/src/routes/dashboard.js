const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.use(authenticate);

router.get('/stats', authorize('admin', 'doctor', 'nurse', 'receptionist'), dashboardController.getStats);
router.get('/appointments-today', authorize('admin', 'doctor', 'nurse', 'receptionist'), dashboardController.getAppointmentsToday);
router.get('/recent-patients', authorize('admin', 'doctor', 'nurse', 'receptionist'), dashboardController.getRecentPatients);

module.exports = router;
