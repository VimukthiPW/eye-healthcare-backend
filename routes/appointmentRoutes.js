const express = require('express');

const router = express.Router();


// =================================================
// Controllers
// =================================================

const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelPatientAppointment,
} = require('../controllers/appointmentController');


// =================================================
// Authentication Middleware
// =================================================

const {
  protect,
} = require('../middleware/authMiddleware');


// =================================================
// Appointment Routes
// =================================================


// -------------------------------------------------
// Book Appointment
// POST /api/appointments
// -------------------------------------------------

router.post(
  '/',
  protect,
  createAppointment
);


// -------------------------------------------------
// Get Patient Appointments
// GET /api/appointments/patient
// -------------------------------------------------

router.get(
  '/patient',
  protect,
  getPatientAppointments
);


// -------------------------------------------------
// Get Doctor Appointments
// GET /api/appointments/doctor
// -------------------------------------------------

router.get(
  '/doctor',
  protect,
  getDoctorAppointments
);


// -------------------------------------------------
// Update Appointment Status
// PUT /api/appointments/:id/status
// -------------------------------------------------
//
// Pending → Accepted
// Pending → Rejected
// Accepted → Completed
// Accepted → Cancelled
//
// -------------------------------------------------

router.put(
  '/:id/status',
  protect,
  updateAppointmentStatus
);


// -------------------------------------------------
// Cancel Patient Appointment
// PUT /api/appointments/:id/cancel
// -------------------------------------------------

router.put(
  '/:id/cancel',
  protect,
  cancelPatientAppointment
);


// =================================================
// Export Router
// =================================================

module.exports = router;