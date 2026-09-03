const Appointment = require('../models/Appointment');
const User = require('../models/User');


// =================================================
// Book New Appointment
// POST /api/appointments
// =================================================

const createAppointment = async (req, res) => {
  try {

    const {
      doctorId,
      date,
      timeSlot,
      appointmentType,
      symptoms,
      notes,
    } = req.body;


    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (!doctorId || !date || !timeSlot) {

      return res.status(400).json({
        success: false,
        message:
          'Doctor ID, date, and time slot are required',
      });

    }


    // -------------------------------------------------
    // Check Doctor
    // -------------------------------------------------

    const doctor = await User.findOne({
      _id: doctorId,
      role: 'Doctor',
    });


    if (!doctor) {

      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });

    }


    // -------------------------------------------------
    // Check whether time slot is already booked
    // -------------------------------------------------

    const existingAppointment =
      await Appointment.findOne({

        doctor: doctorId,

        date: date,

        timeSlot: timeSlot,

        status: {
          $in: [
            'Pending',
            'Accepted',
          ],
        },

      });


    if (existingAppointment) {

      return res.status(409).json({
        success: false,
        message:
          'This time slot is already booked',
      });

    }


    // -------------------------------------------------
    // Patient
    // -------------------------------------------------

    let patientId =
      req.user?._id;


    // Development fallback

    if (!patientId) {

      const patient =
        await User.findOne({
          role: 'Patient',
        });


      if (patient) {

        patientId =
          patient._id;

      }

    }


    if (!patientId) {

      return res.status(400).json({
        success: false,
        message:
          'Patient profile required to book appointment',
      });

    }


    // -------------------------------------------------
    // Create Appointment
    // -------------------------------------------------

    const appointment =
      await Appointment.create({

        patient:
          patientId,

        doctor:
          doctorId,

        date:
          date,

        timeSlot:
          timeSlot,

        appointmentType:
          appointmentType ||
          'In-Person',

        symptoms:
          symptoms ||
          '',

        notes:
          notes ||
          '',

        status:
          'Pending',

      });


    // -------------------------------------------------
    // Populate Appointment
    // -------------------------------------------------

    const populatedAppointment =
      await Appointment.findById(
        appointment._id
      )
        .populate(
          'doctor',
          'name specialization hospital avatar consultationFee rating phone email'
        )
        .populate(
          'patient',
          'name email phone age gender avatar'
        );


    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    res.status(201).json({

      success: true,

      message:
        'Appointment booked successfully',

      appointment:
        populatedAppointment,

    });


  } catch (error) {

    console.error(
      'Create Appointment Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to create appointment',

      error:
        error.message,

    });

  }
};


// =================================================
// Get Patient Appointments
// GET /api/appointments/patient
// =================================================

const getPatientAppointments = async (
  req,
  res
) => {

  try {

    let patientId =
      req.user?._id;


    // -------------------------------------------------
    // Development fallback
    // -------------------------------------------------

    if (!patientId) {

      const patient =
        await User.findOne({
          role: 'Patient',
        });


      if (patient) {

        patientId =
          patient._id;

      }

    }


    if (!patientId) {

      return res.json({

        success: true,

        count: 0,

        appointments: [],

      });

    }


    const appointments =
      await Appointment.find({
        patient:
          patientId,
      })
        .populate(
          'doctor',
          'name specialization hospital avatar consultationFee rating phone email'
        )
        .sort({
          createdAt: -1,
        });


    res.json({

      success: true,

      count:
        appointments.length,

      appointments:
        appointments,

    });


  } catch (error) {

    console.error(
      'Get Patient Appointments Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to get patient appointments',

      error:
        error.message,

    });

  }

};


// =================================================
// Get Doctor Appointments
// GET /api/appointments/doctor
// =================================================

const getDoctorAppointments = async (
  req,
  res
) => {

  try {

    let doctorId =
      req.user?._id;


    // -------------------------------------------------
    // Development fallback
    // -------------------------------------------------

    if (!doctorId) {

      const doctor =
        await User.findOne({
          role: 'Doctor',
        });


      if (doctor) {

        doctorId =
          doctor._id;

      }

    }


    if (!doctorId) {

      return res.json({

        success: true,

        count: 0,

        appointments: [],

      });

    }


    const appointments =
      await Appointment.find({
        doctor:
          doctorId,
      })
        .populate(
          'patient',
          'name email phone age gender avatar address'
        )
        .sort({
          createdAt: -1,
        });


    res.json({

      success: true,

      count:
        appointments.length,

      appointments:
        appointments,

    });


  } catch (error) {

    console.error(
      'Get Doctor Appointments Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to get doctor appointments',

      error:
        error.message,

    });

  }

};


// =================================================
// Cancel Patient Appointment
// PUT /api/appointments/:id/cancel
// =================================================

const cancelPatientAppointment = async (
  req,
  res
) => {

  try {

    // -------------------------------------------------
    // Get logged-in patient
    // -------------------------------------------------

    const patientId =
      req.user?._id;


    if (!patientId) {

      return res.status(401).json({

        success: false,

        message:
          'Patient login required',

      });

    }


    // -------------------------------------------------
    // Find Appointment
    // -------------------------------------------------

    const appointment =
      await Appointment.findById(
        req.params.id
      );


    if (!appointment) {

      return res.status(404).json({

        success: false,

        message:
          'Appointment not found',

      });

    }


    // -------------------------------------------------
    // Make sure appointment belongs to patient
    // -------------------------------------------------

    if (
      appointment.patient.toString() !==
      patientId.toString()
    ) {

      return res.status(403).json({

        success: false,

        message:
          'You can only cancel your own appointment',

      });

    }


    // -------------------------------------------------
    // Check Current Status
    // -------------------------------------------------

    if (
      appointment.status ===
      'Cancelled'
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Appointment is already cancelled',

      });

    }


    if (
      appointment.status ===
      'Rejected'
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Rejected appointment cannot be cancelled',

      });

    }


    if (
      appointment.status ===
      'Completed'
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Completed appointment cannot be cancelled',

      });

    }


    // -------------------------------------------------
    // Cancel Appointment
    // -------------------------------------------------

    appointment.status =
      'Cancelled';


    await appointment.save();


    // -------------------------------------------------
    // Populate Appointment
    // -------------------------------------------------

    const populatedAppointment =
      await Appointment.findById(
        appointment._id
      )
        .populate(
          'doctor',
          'name specialization hospital avatar consultationFee rating phone email'
        )
        .populate(
          'patient',
          'name email phone age gender avatar'
        );


    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    res.json({

      success: true,

      message:
        'Appointment cancelled successfully',

      appointment:
        populatedAppointment,

    });


  } catch (error) {

    console.error(
      'Cancel Patient Appointment Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to cancel appointment',

      error:
        error.message,

    });

  }

};


// =================================================
// Update Appointment Status
// PUT /api/appointments/:id/status
// =================================================

const updateAppointmentStatus = async (
  req,
  res
) => {

  try {

    const {
      status,
      notes,
    } = req.body;


    // -------------------------------------------------
    // Validate Status
    // -------------------------------------------------

    const allowedStatuses = [

      'Pending',

      'Accepted',

      'Rejected',

      'Completed',

      'Cancelled',

    ];


    if (
      status &&
      !allowedStatuses.includes(
        status
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Invalid appointment status',

      });

    }


    // -------------------------------------------------
    // Find Appointment
    // -------------------------------------------------

    const appointment =
      await Appointment.findById(
        req.params.id
      );


    if (!appointment) {

      return res.status(404).json({

        success: false,

        message:
          'Appointment not found',

      });

    }


    // -------------------------------------------------
    // Update Status
    // -------------------------------------------------

    if (status) {

      appointment.status =
        status;

    }


    if (
      typeof notes ===
      'string'
    ) {

      appointment.notes =
        notes;

    }


    const updated =
      await appointment.save();


    // -------------------------------------------------
    // Populate
    // -------------------------------------------------

    const populated =
      await Appointment.findById(
        updated._id
      )
        .populate(
          'doctor',
          'name specialization hospital avatar consultationFee rating phone email'
        )
        .populate(
          'patient',
          'name email phone age gender avatar'
        );


    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    res.json({

      success: true,

      message:
        'Appointment updated successfully',

      appointment:
        populated,

    });


  } catch (error) {

    console.error(
      'Update Appointment Status Error:',
      error
    );


    res.status(500).json({

      success: false,

      message:
        'Failed to update appointment',

      error:
        error.message,

    });

  }

};


// =================================================
// Export
// =================================================

module.exports = {

  createAppointment,

  getPatientAppointments,

  getDoctorAppointments,

  updateAppointmentStatus,

  cancelPatientAppointment,

};