const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ['Patient', 'Doctor'],
      default: 'Patient',
    },

    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },

    phone: {
      type: String,
      default: '+1 (555) 000-0000',
    },

    // =================================================
    // Patient Specific Fields
    // =================================================

    age: {
      type: Number,
      default: 30,
    },

    gender: {
      type: String,
      default: 'Not specified',
    },

    address: {
      type: String,
      default: '',
    },

    // =================================================
    // Doctor Specific Fields
    // =================================================

    specialization: {
      type: String,
      default: 'Ophthalmologist',
    },

    experienceYears: {
      type: Number,
      default: 5,
    },

    rating: {
      type: Number,
      default: 4.8,
    },

    reviewCount: {
      type: Number,
      default: 120,
    },

    hospital: {
      type: String,
      default: 'Vision Health Center',
    },

    consultationFee: {
      type: String,
      default: '$80',
    },

    about: {
      type: String,
      default:
        'Specialist in cornea, cataract surgery, and retinal health care with years of clinical experience.',
    },

    // =================================================
    // Doctor Availability
    // =================================================

    // Old weekday availability
    // Keep this because other parts of the project
    // may still use it.
    availableDays: {
      type: [String],
      default: [],
    },

    // NEW:
    // Exact dates selected by the doctor.
    //
    // Example:
    // [
    //   "2026-09-01",
    //   "2026-09-02",
    //   "2026-09-03"
    // ]
    //
    // Patient side will use these exact dates.
    availableDates: {
      type: [String],
      default: [],
    },

    // Available appointment time slots
    availableTimeSlots: {
      type: [String],
      default: [],
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'User',
  userSchema
);