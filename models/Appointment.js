const mongoose = require('mongoose');


// =================================================
// Appointment Schema
// =================================================

const appointmentSchema = new mongoose.Schema(

  {

    // =================================================
    // Patient
    // =================================================

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },


    // =================================================
    // Doctor
    // =================================================

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },


    // =================================================
    // Appointment Date
    // =================================================

    date: {
      type: String,
      required: true,
    },


    // =================================================
    // Appointment Time
    // =================================================

    timeSlot: {
      type: String,
      required: true,
    },


    // =================================================
    // Appointment Status
    // =================================================
    //
    // Patient books
    //      ↓
    // Pending
    //
    // Doctor accepts
    //      ↓
    // Accepted
    //
    // Doctor rejects
    //      ↓
    // Rejected
    //

    status: {
      type: String,

      enum: [
        'Pending',
        'Accepted',
        'Rejected',
        'Completed',
        'Cancelled',
      ],

      default: 'Pending',
    },


    // =================================================
    // Appointment Type
    // =================================================

    appointmentType: {
      type: String,

      enum: [
        'In-Person',
        'Online Consultation',
      ],

      default: 'In-Person',
    },


    // =================================================
    // Patient Symptoms
    // =================================================

    symptoms: {
      type: String,
      default: '',
      trim: true,
    },


    // =================================================
    // Additional Notes
    // =================================================

    notes: {
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
  'Appointment',
  appointmentSchema
);