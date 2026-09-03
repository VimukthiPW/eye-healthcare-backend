const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'eyecare_super_secret_jwt_key_2026'
      );

      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error('JWT Token Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    // If no token is passed in headers, allow anonymous / mock fallback if needed
    // or return 401. We provide basic fallback for easier testing.
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'Doctor') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Doctors only' });
  }
};

const isPatient = (req, res, next) => {
  if (req.user && req.user.role === 'Patient') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Patients only' });
  }
};

module.exports = { protect, isDoctor, isPatient };
