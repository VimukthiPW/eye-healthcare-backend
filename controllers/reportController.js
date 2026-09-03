const Report = require('../models/Report');
const User = require('../models/User');


// =================================================
// Supported Eye Conditions
// =================================================

const CONDITIONS = [
  'Cataract',
  'Conjunctivitis',
  'Healthy',
];


// =================================================
// Helper - Convert value to number
// =================================================

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};


// =================================================
// Analyze Eye Scan & Create Report
// POST /api/reports/analyze
// =================================================

const analyzeEyeScan = async (req, res) => {

  try {

    // -------------------------------------------------
    // Image URL
    // -------------------------------------------------

    let scanImageUrl =
      req.body.imageUrl || '';

    if (req.file) {

      scanImageUrl =
        `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;

    }


    // -------------------------------------------------
    // Get Patient
    // -------------------------------------------------
    // If logged in, use logged-in patient.
    // If not logged in, try to find a Patient.
    // If no Patient exists, continue with null.
    // -------------------------------------------------

    let patientId = null;

    if (req.user && req.user._id) {

      patientId = req.user._id;

    } else {

      const existingPatient =
        await User.findOne({
          role: 'Patient',
        });

      if (existingPatient) {

        patientId =
          existingPatient._id;

      }

    }


    // -------------------------------------------------
    // Get ML Prediction
    // -------------------------------------------------

    let predictedCondition =
      req.body.predictedCondition;


    let confidenceScore =
      toNumber(
        req.body.confidenceScore
      );


    // -------------------------------------------------
    // Get Prediction Probabilities
    // -------------------------------------------------

    let probabilities = {

      Cataract:
        toNumber(
          req.body.probabilities?.Cataract
        ),

      Conjunctivitis:
        toNumber(
          req.body.probabilities?.Conjunctivitis
        ),

      Healthy:
        toNumber(
          req.body.probabilities?.Healthy
        ),

    };


    // -------------------------------------------------
    // Support JSON String Probabilities
    // -------------------------------------------------

    if (
      typeof req.body.probabilities ===
      'string'
    ) {

      try {

        const parsed =
          JSON.parse(
            req.body.probabilities
          );


        probabilities = {

          Cataract:
            toNumber(
              parsed.Cataract
            ),

          Conjunctivitis:
            toNumber(
              parsed.Conjunctivitis
            ),

          Healthy:
            toNumber(
              parsed.Healthy
            ),

        };

      } catch (error) {

        console.log(
          'Could not parse probabilities:',
          error.message
        );

      }

    }


    // -------------------------------------------------
    // If prediction is not provided,
    // calculate highest probability
    // -------------------------------------------------

    if (!predictedCondition) {

      const highest =
        Object.entries(
          probabilities
        ).sort(
          (a, b) => b[1] - a[1]
        )[0];


      if (
        highest &&
        highest[1] > 0
      ) {

        predictedCondition =
          highest[0];

        confidenceScore =
          highest[1];

      }

    }


    // -------------------------------------------------
    // Validate Condition
    // -------------------------------------------------

    if (
      !CONDITIONS.includes(
        predictedCondition
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Invalid eye disease prediction',

        allowedConditions:
          CONDITIONS,

      });

    }


    // -------------------------------------------------
    // If confidence not provided,
    // use predicted probability
    // -------------------------------------------------

    if (
      !confidenceScore ||
      confidenceScore <= 0
    ) {

      confidenceScore =
        probabilities[
          predictedCondition
        ] || 0;

    }


    // =================================================
    // Severity
    // =================================================

    let severity = 'Normal';


    if (
      predictedCondition ===
      'Cataract'
    ) {

      severity = 'Moderate';

    }


    if (
      predictedCondition ===
      'Conjunctivitis'
    ) {

      severity = 'Mild';

    }


    if (
      predictedCondition ===
      'Healthy'
    ) {

      severity = 'Normal';

    }


    // =================================================
    // Findings
    // =================================================

    let findings = [];


    if (
      predictedCondition ===
      'Cataract'
    ) {

      findings = [

        'Possible cataract-related changes detected',

        'Clouding pattern identified in the eye image',

        'Further clinical examination is recommended',

      ];

    }


    else if (
      predictedCondition ===
      'Conjunctivitis'
    ) {

      findings = [

        'Possible conjunctivitis-related appearance detected',

        'Signs of eye surface inflammation may be present',

        'Further clinical examination is recommended',

      ];

    }


    else {

      findings = [

        'No significant abnormality detected by the screening model',

        'Eye image appears consistent with a healthy eye',

      ];

    }


    // =================================================
    // Recommendations
    // =================================================

    let recommendations = [];


    if (
      predictedCondition ===
      'Cataract'
    ) {

      recommendations = [

        'Consult an ophthalmologist for a comprehensive eye examination',

        'Continue regular eye health check-ups',

        'Seek professional assessment if vision changes occur',

      ];

    }


    else if (
      predictedCondition ===
      'Conjunctivitis'
    ) {

      recommendations = [

        'Consult an eye-care professional if symptoms persist',

        'Avoid touching or rubbing the eyes',

        'Maintain good eye and hand hygiene',

      ];

    }


    else {

      recommendations = [

        'Continue regular eye check-ups',

        'Maintain good eye hygiene',

        'Follow healthy screen-use habits',

      ];

    }


    // =================================================
    // Patient Details
    // =================================================

    let patient = null;

    if (patientId) {

      patient =
        await User.findById(
          patientId
        );

    }


    const patientName =
      patient?.name ||
      req.body.patientName ||
      'John Doe';


    const patientIdText =
      patient?._id
        ? patient._id.toString()
        : req.body.patientId ||
          'P123456';


    // =================================================
    // Create Report
    // =================================================

    const report =
      await Report.create({

        patient:
          patientId || null,

        patientName:
          patientName,

        patientId:
          patientIdText,

        title:
          req.body.title ||
          'Eye Health Screening Report',

        scanImageUrl:
          scanImageUrl,

        predictedCondition:
          predictedCondition,

        confidenceScore:
          confidenceScore,

        probabilities: {

          Cataract:
            probabilities.Cataract,

          Conjunctivitis:
            probabilities.Conjunctivitis,

          Healthy:
            probabilities.Healthy,

        },

        severity:
          severity,

        findings:
          findings,

        recommendations:
          recommendations,

        status:
          'Generated',

        emailSent:
          false,

        emailSentTo:
          '',

      });


    // =================================================
    // Populate Patient
    // =================================================

    const populatedReport =
      await Report.findById(
        report._id
      ).populate(
        'patient',
        'name email phone age gender avatar'
      );


    // =================================================
    // Response
    // =================================================

    res.status(201).json({

      success: true,

      message:
        'Eye screening report created successfully',

      report:
        populatedReport,

    });


  } catch (error) {

    console.error(
      'Analyze Eye Scan Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to create eye screening report',

      error:
        error.message,

    });

  }

};


// =================================================
// Get Patient Reports
// GET /api/reports
// =================================================

const getPatientReports = async (
  req,
  res
) => {

  try {

    let patientId = null;


    if (
      req.user &&
      req.user._id
    ) {

      patientId =
        req.user._id;

    } else {

      const patient =
        await User.findOne({
          role: 'Patient',
        });

      patientId =
        patient?._id || null;

    }


    // If no patient exists,
    // return all generated reports
    // for development/testing.

    let reports;


    if (patientId) {

      reports =
        await Report.find({
          patient: patientId,
        })
          .populate(
            'sentToDoctor',
            'name specialization hospital avatar'
          )
          .sort({
            createdAt: -1,
          });

    } else {

      reports =
        await Report.find()
          .populate(
            'sentToDoctor',
            'name specialization hospital avatar'
          )
          .sort({
            createdAt: -1,
          });

    }


    res.json({

      success: true,

      count:
        reports.length,

      reports:
        reports,

    });


  } catch (error) {

    console.error(
      'Get Patient Reports Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to get patient reports',

      error:
        error.message,

    });

  }

};


// =================================================
// Get Report By ID
// GET /api/reports/:id
// =================================================

const getReportById = async (
  req,
  res
) => {

  try {

    const report =
      await Report.findById(
        req.params.id
      )
        .populate(
          'patient',
          'name email phone age gender avatar'
        )
        .populate(
          'sentToDoctor',
          'name specialization hospital avatar phone email'
        );


    if (!report) {

      return res.status(404).json({

        success: false,

        message:
          'Report not found',

      });

    }


    res.json({

      success: true,

      report:
        report,

    });


  } catch (error) {

    console.error(
      'Get Report By ID Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to get report',

      error:
        error.message,

    });

  }

};


// =================================================
// Send Report To Doctor
// POST /api/reports/:id/send
// =================================================

const sendReportToDoctor = async (
  req,
  res
) => {

  try {

    const {
      doctorId,
      notes,
    } = req.body;


    const report =
      await Report.findById(
        req.params.id
      );


    if (!report) {

      return res.status(404).json({

        success: false,

        message:
          'Report not found',

      });

    }


    const doctor =
      await User.findOne({

        _id:
          doctorId,

        role:
          'Doctor',

      });


    if (!doctor) {

      return res.status(404).json({

        success: false,

        message:
          'Doctor not found',

      });

    }


    report.sentToDoctor =
      doctorId;


    report.status =
      'Sent to Doctor';


    if (notes) {

      report.doctorNotes =
        notes;

    }


    const updated =
      await report.save();


    const populated =
      await Report.findById(
        updated._id
      )
        .populate(
          'patient',
          'name email phone age gender'
        )
        .populate(
          'sentToDoctor',
          'name specialization hospital avatar'
        );


    res.json({

      success: true,

      message:
        'Report sent to doctor successfully',

      report:
        populated,

    });


  } catch (error) {

    console.error(
      'Send Report To Doctor Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to send report to doctor',

      error:
        error.message,

    });

  }

};


// =================================================
// Get Reports Sent To Doctor
// GET /api/reports/doctor
// =================================================

const getDoctorReports = async (
  req,
  res
) => {

  try {

    let doctorId = null;


    if (
      req.user &&
      req.user._id
    ) {

      doctorId =
        req.user._id;

    } else {

      const doctor =
        await User.findOne({
          role: 'Doctor',
        });

      doctorId =
        doctor?._id || null;

    }


    if (!doctorId) {

      return res.json({

        success: true,

        count: 0,

        reports: [],

      });

    }


    const reports =
      await Report.find({
        sentToDoctor:
          doctorId,
      })
        .populate(
          'patient',
          'name email phone age gender avatar'
        )
        .sort({
          createdAt: -1,
        });


    res.json({

      success: true,

      count:
        reports.length,

      reports:
        reports,

    });


  } catch (error) {

    console.error(
      'Get Doctor Reports Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to get doctor reports',

      error:
        error.message,

    });

  }

};


// =================================================
// Export
// =================================================

module.exports = {

  analyzeEyeScan,

  getPatientReports,

  getReportById,

  sendReportToDoctor,

  getDoctorReports,

};