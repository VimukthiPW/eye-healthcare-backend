const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();

// Store uploaded image temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

// Railway MobileNetV3 ML API
const ML_API_URL =
  'https://eye-healthcare-ml-api-production.up.railway.app';

// =====================================================
// POST /api/eye-disease/predict
// =====================================================

router.post('/predict', upload.single('image'), async (req, res) => {
  try {
    // Check whether image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded',
      });
    }

    console.log('📷 Eye image received');
    console.log('📤 Sending image to MobileNetV3 ML API...');

    // Create form data
    const formData = new FormData();

    formData.append('image', req.file.buffer, {
      filename: req.file.originalname || 'eye-image.jpg',
      contentType: req.file.mimetype || 'image/jpeg',
    });

    // =====================================================
    // Send image to Railway MobileNetV3 ML API
    // =====================================================

    const response = await axios.post(
      `${ML_API_URL}/predict`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },

        maxContentLength: Infinity,
        maxBodyLength: Infinity,

        // ML prediction can take some time
        timeout: 120000,
      }
    );

    console.log('✅ MobileNetV3 prediction received');

    // =====================================================
    // Send ML result back to React Native
    // =====================================================

    return res.status(200).json(response.data);

  } catch (error) {
    console.error('❌ Eye disease prediction error');

    if (error.response) {
      console.error('ML API status:', error.response.status);
      console.error('ML API response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }

    return res.status(500).json({
      success: false,
      message: 'Eye disease prediction failed',
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;