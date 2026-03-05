const express = require('express');
const router = express.Router();
const { ingestTelemetry, getLatestReadings, ingestSmartIrrigationTelemetry, getSensorHistory } = require('../controllers/iotController');
const { protect } = require('../middleware/auth');

// New endpoints for Smart Irrigation Monitoring and AI Decision Dashboard
router.post('/sensor-data', ingestSmartIrrigationTelemetry);
router.get('/history', getSensorHistory);

// Public route for hardware devices (protected internally via API Key header)
router.post('/ingest', ingestTelemetry);

// Protected routes for React dashboard
router.get('/farm/:farmId/latest', protect, getLatestReadings);

module.exports = router;
