const express = require('express');
const router = express.Router();
const LogisticsPredictorService = require('../services/logisticsPredictorService');
const { protect } = require('../middleware/auth'); // Ensure buyer is authenticated

// @route   POST /api/logistics/predict-risk
// @desc    Generate predictive ETA and spoilage risk for a specific transit route
// @access  Private
router.post('/predict-risk', protect, async (req, res) => {
    try {
        const {
            vendorId,
            listingId,
            cropName,
            sourceLat, sourceLon,
            destLat, destLon
        } = req.body;

        // Basic validation
        if (!vendorId || !listingId || !cropName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: vendorId, listingId, or cropName'
            });
        }

        const buyerId = req.user.id || req.user._id;

        // Generate inference
        const prediction = await LogisticsPredictorService.generatePrediction({
            buyerId,
            vendorId,
            listingId,
            cropName,
            sourceLat: parseFloat(sourceLat) || null,
            sourceLon: parseFloat(sourceLon) || null,
            destLat: parseFloat(destLat) || null,
            destLon: parseFloat(destLon) || null
        });

        res.status(200).json({
            success: true,
            message: 'Logistics intelligence computed successfully',
            data: prediction
        });

    } catch (error) {
        console.error('Smart Logistics Prediction Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server failed to calculate logistics risk',
            error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal Server Error'
        });
    }
});

module.exports = router;
