const express = require('express');

const router = express.Router();

const {
  analyzeEyeScan,
  getPatientReports,
  getReportById,
  sendReportToDoctor,
  getDoctorReports,
} = require('../controllers/reportController');

const { protect } =
  require('../middleware/authMiddleware');

const upload =
  require('../middleware/uploadMiddleware');


// =================================================
// CREATE / ANALYZE REPORT
// =================================================

// POST /api/reports/analyze
//
// Currently public because Page06 does not send JWT.
// Later, after login authentication is connected,
// change this to:
//
// router.post(
//   '/analyze',
//   protect,
//   upload.single('scanImage'),
//   analyzeEyeScan
// );

router.post(
  '/analyze',
  upload.single('scanImage'),
  analyzeEyeScan
);


// =================================================
// GET PATIENT REPORTS
// =================================================

// GET /api/reports
//
// Public for development/testing.
// Page09 does not currently send JWT.

router.get(
  '/',
  getPatientReports
);


// =================================================
// GET DOCTOR REPORTS
// =================================================

// GET /api/reports/doctor

router.get(
  '/doctor',
  getDoctorReports
);


// =================================================
// GET SINGLE REPORT
// =================================================

// GET /api/reports/:id

router.get(
  '/:id',
  getReportById
);


// =================================================
// SEND REPORT TO DOCTOR
// =================================================

// POST /api/reports/:id/send
//
// This can remain protected.

router.post(
  '/:id/send',
  protect,
  sendReportToDoctor
);


module.exports = router;