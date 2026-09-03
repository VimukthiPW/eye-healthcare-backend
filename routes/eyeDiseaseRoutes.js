const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

// Store uploaded image temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

// POST /api/eye-disease/predict
router.post('/predict', upload.single('image'), async (req, res) => {
  try {
    // Check whether image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded',
      });
    }

    // Create form data for Python ML API
    const formData = new FormData();

    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Send image to Python ML API
    const response = await axios.post(
      'http://127.0.0.1:8000/predict',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Send ML result back to React Native
    return res.json(response.data);

  } catch (error) {
    console.error(
      'Eye disease prediction error:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Eye disease prediction failed',
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;