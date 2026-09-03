const mongoose = require('mongoose');


// =================================================
// Report Schema
// =================================================

const reportSchema = new mongoose.Schema(

  {

    // =================================================
    // Patient Information
    // =================================================

    // Patient who generated the report
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },

    // Patient name
    patientName: {
      type: String,
      default: 'John Doe',
      trim: true,
    },

    // Patient ID
    patientId: {
      type: String,
      default: 'P123456',
      trim: true,
    },


    // =================================================
    // Report Information
    // =================================================

    title: {
      type: String,
      default: 'Eye Health Screening Report',
      trim: true,
    },


    // =================================================
    // Analyzed Image
    // =================================================

    scanImageUrl: {
      type: String,
      default: '',
    },


    // =================================================
    // ML Prediction
    // =================================================

    predictedCondition: {
      type: String,
      required: true,
      enum: [
        'Cataract',
        'Conjunctivitis',
        'Healthy',
      ],
    },


    // Confidence of predicted class
    confidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },


    // =================================================
    // Prediction Probabilities
    // =================================================

    probabilities: {

      Cataract: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      Conjunctivitis: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      Healthy: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

    },


    // =================================================
    // Severity
    // =================================================

    severity: {
      type: String,

      enum: [
        'Normal',
        'Mild',
        'Moderate',
        'Severe',
      ],

      default: 'Normal',
    },


    // =================================================
    // Findings
    // =================================================

    findings: {
      type: [String],
      default: [],
    },


    // =================================================
    // Recommendations
    // =================================================

    recommendations: {
      type: [String],
      default: [],
    },


    // =================================================
    // Doctor Information
    // =================================================

    // Doctor who receives the report
    sentToDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },


    // =================================================
    // Report Status
    // =================================================

    status: {
      type: String,

      enum: [
        'Generated',
        'Sent to Doctor',
        'Reviewed',
      ],

      default: 'Generated',
    },


    // Doctor notes
    doctorNotes: {
      type: String,
      default: '',
    },


    // =================================================
    // Email Status
    // =================================================

    emailSent: {
      type: Boolean,
      default: false,
    },

    emailSentTo: {
      type: String,
      default: '',
      trim: true,
    },

  },


  // =================================================
  // Timestamps
  // =================================================

  {
    timestamps: true,
  }

);


// =================================================
// Export Model
// =================================================

module.exports = mongoose.model(
  'Report',
  reportSchema
);