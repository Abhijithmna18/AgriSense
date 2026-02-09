const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    generatePestPrediction,
    getFarmPredictions,
    getMyPredictions,
    getPredictionById,
    archivePrediction
} = require('../controllers/pestPredictionController');

// All routes require authentication
router.use(protect);
router.use(authorize('farmer', 'admin'));

// Prediction routes
router.post('/analyze', generatePestPrediction);
router.get('/my-predictions', getMyPredictions);
router.get('/farm/:farmId', getFarmPredictions);
router.get('/:id', getPredictionById);
router.put('/:id/archive', archivePrediction);

module.exports = router;
