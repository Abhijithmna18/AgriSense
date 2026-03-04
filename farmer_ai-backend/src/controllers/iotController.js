const SensorData = require('../models/SensorData');
const Farm = require('../models/Farm');

/**
 * @desc    Ingest telemetry data from ESP32 devices
 * @route   POST /api/sensors/ingest
 * @access  Public (Protected by API Key in Headers)
 */
exports.ingestTelemetry = async (req, res) => {
    try {
        const { deviceId, farmId, metrics, pumpStatus } = req.body;
        const apiKey = req.headers['x-api-key'];

        // Basic hardware authentication
        if (apiKey !== process.env.IOT_API_KEY) {
            return res.status(401).json({ success: false, error: 'Unauthorized hardware device' });
        }

        // Verify farm exists
        const farm = await Farm.findById(farmId);
        if (!farm) {
            return res.status(404).json({ success: false, error: 'Target farm not found matching device' });
        }

        // Create new time-series record
        const telemetry = await SensorData.create({
            farm: farmId,
            deviceId,
            metrics,
            pumpStatus
        });

        // Automation Hook: If soil moisture drops below critical (e.g. 25%), trigger alert logic here
        // (In a full implementation, this would fire an event via Socket.io / FCM)

        res.status(201).json({
            success: true,
            message: 'Telemetry ingested successfully',
            data: { _id: telemetry._id }
        });
    } catch (error) {
        console.error("IoT Ingestion Error:", error.message);
        res.status(500).json({ success: false, error: 'Hardware telemetry ingestion failed' });
    }
};

/**
 * @desc    Get latest sensor readings for a farm dashboard
 * @route   GET /api/sensors/farm/:farmId/latest
 * @access  Private
 */
exports.getLatestReadings = async (req, res) => {
    try {
        const readings = await SensorData.find({ farm: req.params.farmId })
            .sort({ timestamp: -1 })
            .limit(24); // Return last 24 readings for graphing

        res.status(200).json({ success: true, count: readings.length, data: readings });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to retrieve sensor data' });
    }
};
