const User = require('../models/User');

// @desc    Get all doctors with optional search and filtering
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const { search, specialty } = req.query;

    let query = { role: 'Doctor' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
      ];
    }

    if (specialty && specialty !== 'All') {
      query.specialization = {
        $regex: specialty,
        $options: 'i',
      };
    }

    const doctors = await User.find(query).select('-password');

    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'Doctor',
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        message: 'Doctor not found',
      });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor by ID error:', error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// @desc    Update doctor profile and availability
// @route   PUT /api/doctors/:id
// @access  Public
const updateDoctor = async (req, res) => {
  try {
    const {
      about,
      availableDays,
      availableDates,
      availableTimeSlots,
    } = req.body;


    // =========================================
    // Find Doctor
    // =========================================

    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'Doctor',
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }


    // =========================================
    // Update About
    // =========================================

    if (about !== undefined) {
      doctor.about = about;
    }


    // =========================================
    // Update Available Days
    // =========================================

    if (Array.isArray(availableDays)) {
      doctor.availableDays = [
        ...new Set(
          availableDays
            .map((day) => String(day).trim())
            .filter(Boolean)
        ),
      ];
    }


    // =========================================
    // Update Available Dates
    // =========================================

    if (Array.isArray(availableDates)) {
      doctor.availableDates = [
        ...new Set(
          availableDates
            .map((date) => String(date).trim())
            .filter(Boolean)
        ),
      ];
    }


    // =========================================
    // Update Available Time Slots
    // =========================================

    if (Array.isArray(availableTimeSlots)) {
      doctor.availableTimeSlots = [
        ...new Set(
          availableTimeSlots
            .map((time) => String(time).trim())
            .filter(Boolean)
        ),
      ];
    }


    // =========================================
    // Save Doctor
    // =========================================

    const updatedDoctor = await doctor.save();


    // =========================================
    // Console Check
    // =========================================

    console.log('=================================');
    console.log('Doctor Availability Updated');
    console.log('Doctor ID:', updatedDoctor._id);

    console.log(
      'Available Days:',
      updatedDoctor.availableDays
    );

    console.log(
      'Available Dates:',
      updatedDoctor.availableDates
    );

    console.log(
      'Available Time Slots:',
      updatedDoctor.availableTimeSlots
    );

    console.log('=================================');


    // =========================================
    // Response
    // =========================================

    res.json({
      success: true,

      message:
        'Doctor profile and availability updated successfully',

      doctor: {
        id: updatedDoctor._id,

        name: updatedDoctor.name,

        email: updatedDoctor.email,

        avatar: updatedDoctor.avatar,

        specialization:
          updatedDoctor.specialization,

        experienceYears:
          updatedDoctor.experienceYears,

        rating:
          updatedDoctor.rating,

        reviewCount:
          updatedDoctor.reviewCount,

        hospital:
          updatedDoctor.hospital,

        consultationFee:
          updatedDoctor.consultationFee,

        about:
          updatedDoctor.about,

        availableDays:
          updatedDoctor.availableDays,

        availableDates:
          updatedDoctor.availableDates,

        availableTimeSlots:
          updatedDoctor.availableTimeSlots,
      },
    });

  } catch (error) {
    console.error(
      'Update doctor error:',
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctor,
};