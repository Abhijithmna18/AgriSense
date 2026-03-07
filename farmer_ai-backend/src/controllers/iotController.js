const SensorData = require('../models/SensorData');
const IoTSensorData = require('../models/IoTSensorData');
const Farm = require('../models/Farm');
const axios = require('axios');

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

let mockInterval = null;
let lastRealDataTime = 0;

// @desc    Ingest telemetry data from ESP32 devices for Smart Irrigation
// @route   POST /api/iot/sensor-data
// @access  Public
exports.ingestSmartIrrigationTelemetry = async (req, res) => {
    try {
        let { temperature, humidity, soil_moisture, water_flow, pump_status } = req.body;

        // Track the last time real data was received to stop mock generation
        lastRealDataTime = Date.now();

        // FLOW METER FIX: Apply noise filtering and pump-state validation
        // Only record flow if pump is ON and flow exceeds noise threshold
        const FLOW_NOISE_THRESHOLD = 0.1; // L/min - ignore readings below this
        
        if (!pump_status || pump_status === 'OFF' || pump_status === false) {
            // Pump is OFF - force flow to zero regardless of sensor reading
            water_flow = 0;
        } else if (water_flow < FLOW_NOISE_THRESHOLD) {
            // Pump is ON but reading is below noise threshold - likely sensor noise
            water_flow = 0;
        }

        // 1. Call Python AI Service
        let aiDecision = { irrigation_needed: false, duration: 0, confidence: 0 };
        try {
            const aiRes = await axios.post(`${PYTHON_AI_URL}/predict/smart-irrigation`, {
                temperature, humidity, soil_moisture, water_flow
            }, { timeout: 5000 });
            aiDecision = aiRes.data;
        } catch (err) {
            console.error('Python AI Service unavailable for Smart Irrigation:', err.message);
        }

        // 2. Save to database
        const sensorRecord = await IoTSensorData.create({
            temperature,
            humidity,
            soil_moisture,
            water_flow,
            pump_status: pump_status || 'UNKNOWN',
            irrigation_needed: aiDecision.irrigation_needed,
            irrigation_duration: aiDecision.duration,
            confidence: aiDecision.confidence
        });

        // 3. Broadcast via WebSocket
        const io = req.app.get('io');
        if (io) {
            io.emit('iot-data', sensorRecord);
        }

        res.status(201).json({ success: true, data: sensorRecord });

    } catch (error) {
        console.error("Smart Irrigation Ingestion Error:", error.message);
        res.status(500).json({ success: false, error: 'Telemetry ingestion failed' });
    }
};

// Start the Backend Mock Data Generator
exports.startMockDataGenerator = (io) => {
    if (mockInterval) clearInterval(mockInterval);

    console.log('[IOT Mock Generator] Starting 5s mock interval for Smart Irrigation');

    mockInterval = setInterval(async () => {
        // Only generate mock data if no real data has been received in the last 15 seconds
        if (Date.now() - lastRealDataTime < 15000) return;

        try {
            // Generate Realistic Values
            const temperature = parseFloat((Math.random() * (35 - 20) + 20).toFixed(1));
            const humidity = parseFloat((Math.random() * (90 - 40) + 40).toFixed(1));
            const soil_moisture = parseFloat((Math.random() * (80 - 5) + 5).toFixed(1));
            
            // Simulate pump cycling: 70% OFF, 30% ON
            const pump_status = Math.random() > 0.7 ? 'ON' : 'OFF';
            
            // Water flow should only be non-zero when pump is ON
            let water_flow = 0;
            if (pump_status === 'ON') {
                // Realistic flow rate: 1.0 - 2.5 L/min when pump is running
                water_flow = parseFloat((Math.random() * 1.5 + 1.0).toFixed(2));
            }

            // Call Python AI Service
            let aiDecision = { irrigation_needed: false, duration: 0, confidence: 0 };
            try {
                const aiRes = await axios.post(`${PYTHON_AI_URL}/predict/smart-irrigation`, {
                    temperature, humidity, soil_moisture, water_flow
                }, { timeout: 5000 });
                aiDecision = aiRes.data;
            } catch (err) {
                // Silently ignore AI errors in mock generator to avoid spamming logs
            }

            // Save to database
            const sensorRecord = await IoTSensorData.create({
                temperature,
                humidity,
                soil_moisture,
                water_flow,
                pump_status,
                irrigation_needed: aiDecision.irrigation_needed,
                irrigation_duration: aiDecision.duration,
                confidence: aiDecision.confidence
            });

            // Broadcast
            if (io) {
                io.emit('iot-data', sensorRecord);
            }
        } catch (err) {
            // Ignore mock gen errors
        }
    }, 5000);
};

// @desc    Get historical data for the dashboard charts
// @route   GET /api/iot/history
// @access  Public
exports.getSensorHistory = async (req, res) => {
    try {
        const history = await IoTSensorData.find().sort({ timestamp: -1 }).limit(50);
        res.status(200).json({ success: true, data: history.reverse() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch history' });
    }
};

// Keeping the original ingestion for backward compatibility
exports.ingestTelemetry = async (req, res) => {
    try {
        const { deviceId, farmId, metrics, pumpStatus } = req.body;
        const apiKey = req.headers['x-api-key'];

        if (apiKey !== process.env.IOT_API_KEY) {
            return res.status(401).json({ success: false, error: 'Unauthorized hardware device' });
        }

        const farm = await Farm.findById(farmId);
        if (!farm) {
            return res.status(404).json({ success: false, error: 'Target farm not found matching device' });
        }

        const telemetry = await SensorData.create({
            farm: farmId,
            deviceId,
            metrics,
            pumpStatus
        });

        res.status(201).json({
            success: true,
            data: { _id: telemetry._id }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Hardware telemetry ingestion failed' });
    }
};

exports.getLatestReadings = async (req, res) => {
    try {
        const readings = await SensorData.find({ farm: req.params.farmId })
            .sort({ timestamp: -1 })
            .limit(24);
        res.status(200).json({ success: true, count: readings.length, data: readings });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to retrieve sensor data' });
    }
};
