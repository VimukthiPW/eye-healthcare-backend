const express = require('express');

const router = express.Router();

const {
  getDoctors,
  getDoctorById,
  updateDoctor,
} = require('../controllers/doctorController');

// Get all doctors
router.get('/', getDoctors);

// Get doctor by ID
router.get('/:id', getDoctorById);

// Update doctor profile & availability
router.put('/:id', updateDoctor);

module.exports = router;