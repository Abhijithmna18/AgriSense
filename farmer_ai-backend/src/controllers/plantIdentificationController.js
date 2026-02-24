const { identifyPlant } = require('../services/plantIdentificationService');
const DiseaseScan = require('../models/DiseaseScan');
const fs = require('fs');
const AppError = require('../utils/AppError');

/**
 * Handle plant identification request
 * @route POST /api/ai/identify
 * @access Private
 */
const identifyPlantController = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('No image file uploaded', 400);
        }

        const imagePath = req.file.path;
        const mimeType = req.file.mimetype;

        const { latitude, longitude } = req.body;

        // Call the AI service
        const aiResponse = await identifyPlant(imagePath, mimeType);

        const scanData = {
            user: req.user._id,
            imageUrl: imagePath, // In real app, upload to S3/Cloudinary and store URL. Here using local path.
            status: aiResponse.health_analysis?.severity === 'none' ? 'healthy' : 'detected',
            diseaseName: aiResponse.health_analysis?.visible_issues[0] || 'Healthy',
            confidence: aiResponse.confidence,
            severity: aiResponse.health_analysis?.severity,
            symptoms: aiResponse.health_analysis?.visible_issues,
            treatment: {
                organic: ['Neem Oil', 'Pruning'], // Mock suggestions based on AI text would be better
                chemical: ['Fungicide'],
                prevention: ['Crop Rotation']
            }
        };

        // Add location if provided
        if (latitude && longitude) {
            scanData.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        // Save to Database
        const diseaseScan = await DiseaseScan.create(scanData);

        res.status(200).json({
            success: true,
            data: diseaseScan,
            aiDetails: aiResponse
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { identifyPlantController };
