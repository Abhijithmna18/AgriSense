const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { identifyPlantController } = require('../controllers/plantIdentificationController');
const { getIrrigationRecommendation } = require('../controllers/aiIrrigationController');
const { protect } = require('../middleware/auth'); // Assuming we want this protected

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, 'plant-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Route: POST /api/ai/identify
// Access: Private (Logged in users)
router.post('/identify', protect, upload.single('image'), identifyPlantController);

// Route: POST /api/ai/irrigation-recommendation
// Access: Private
router.post('/irrigation-recommendation', protect, getIrrigationRecommendation);

module.exports = router;
