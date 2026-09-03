require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');


// =================================================
// Routes
// =================================================

const authRoutes =
  require('./routes/authRoutes');

const eyeDiseaseRoutes =
  require('./routes/eyeDiseaseRoutes');

const reportRoutes =
  require('./routes/reportRoutes');

const reportSendRoutes =
  require('./routes/reportSendRoutes');

const appointmentRoutes =
  require('./routes/appointmentRoutes');

const doctorRoutes =
  require('./routes/doctorRoutes');

const botRoutes =
  require('./routes/botRoutes');


// =================================================
// Create Express App
// =================================================

const app = express();


// =================================================
// Connect MongoDB
// =================================================

connectDB();


// =================================================
// Middleware
// =================================================

app.use(cors());

app.use(express.json());


// =================================================
// Static Uploads
// =================================================

app.use(
  '/uploads',
  express.static('uploads')
);


// =================================================
// API Routes
// =================================================


// -------------------------------------------------
// Authentication Routes
// -------------------------------------------------

app.use(
  '/api/auth',
  authRoutes
);


// -------------------------------------------------
// Eye Disease / ML Prediction Routes
// -------------------------------------------------

app.use(
  '/api/eye-disease',
  eyeDiseaseRoutes
);


// -------------------------------------------------
// Report Database Routes
// -------------------------------------------------

app.use(
  '/api/reports',
  reportRoutes
);


// -------------------------------------------------
// Medical Report Email Routes
// -------------------------------------------------

app.use(
  '/api/reports',
  reportSendRoutes
);


// -------------------------------------------------
// Appointment Routes
// -------------------------------------------------

app.use(
  '/api/appointments',
  appointmentRoutes
);


// -------------------------------------------------
// Doctor Routes
// -------------------------------------------------

app.use(
  '/api/doctors',
  doctorRoutes
);


// -------------------------------------------------
// Eagle Vision AI Chatbot Routes
// -------------------------------------------------
//
// POST /api/bot/chat
//

app.use(
  '/api/bot',
  botRoutes
);


// =================================================
// Health Check
// =================================================

app.get(
  '/api/health',
  (req, res) => {

    res.json({

      success: true,

      message:
        'Eye Healthcare Backend is running'

    });

  }
);


// =================================================
// Root Route
// =================================================

app.get(
  '/',
  (req, res) => {

    res.json({

      success: true,

      message:
        'Eye Healthcare Backend API is running'

    });

  }
);


// =================================================
// 404 Handler
// =================================================

app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        `Route not found: ${req.method} ${req.originalUrl}`

    });

  }
);


// =================================================
// Global Error Handler
// =================================================

app.use(
  (err, req, res, next) => {

    console.error(
      'Server Error:',
      err
    );


    res.status(
      err.status || 500
    ).json({

      success: false,

      message:
        err.message ||
        'Internal server error'

    });

  }
);


// =================================================
// Server Port
// =================================================

const PORT =
  process.env.PORT || 5000;


// =================================================
// Start Server
// =================================================

app.listen(
  PORT,
  () => {

    console.log(
      '======================================'
    );

    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      `API: http://localhost:${PORT}`
    );

    console.log(
      `Health: http://localhost:${PORT}/api/health`
    );

    console.log(
      `Auth: http://localhost:${PORT}/api/auth`
    );

    console.log(
      `Doctors: http://localhost:${PORT}/api/doctors`
    );

    console.log(
      `Appointments: http://localhost:${PORT}/api/appointments`
    );

    console.log(
      `Chatbot: http://localhost:${PORT}/api/bot`
    );

    console.log(
      '======================================'
    );

  }
);