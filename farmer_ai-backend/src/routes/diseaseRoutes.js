const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { checkMLHealth } = require('../controllers/diseaseController');

// Configure Multer for temp image uploads
const upload = multer({
    dest: 'uploads/temp/',
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// @route   POST /api/ml/predict-disease
// @desc    Proxy image upload to the FastAPI Plant Disease Model
// @access  Private
router.post('/predict-disease', protect, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    try {
        // Construct form data to send to FastAPI
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // Hardcoded to the local FastAPI port (8000) for now. 
        // In production, this should be an environment variable.
        const mlBaseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
        const fastApiUrl = `${mlBaseUrl}/predict-disease`;

        const response = await axios.post(fastApiUrl, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            // Increase timeout if ML inference takes time
            timeout: 30000
        });

        // Clean up the temporarily stored file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
        });

        // Return the FastAPI response directly to the frontend
        res.status(200).json(response.data);

    } catch (error) {
        // Clean up on error too
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error('FastAPI Proxy Error:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'Machine Learning service is currently unavailable. Please ensure the Python server is running on port 8000.'
            });
        }

        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.detail || 'Error communicating with ML service',
        });
    }
});

// @route   GET /api/ml/health
// @desc    Check if the Python ML service is running
// @access  Public
router.get('/health', checkMLHealth);

module.exports = router;
