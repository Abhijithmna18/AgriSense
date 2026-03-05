const mongoose = require('mongoose');

const iotSensorDataSchema = new mongoose.Schema({
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    soil_moisture: {
        type: Number,
        required: true
    },
    water_flow: {
        type: Number,
        required: true
    },
    irrigation_needed: {
        type: Boolean,
        default: false
    },
    irrigation_duration: {
        type: Number,
        default: 0
    },
    confidence: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('IoTSensorData', iotSensorDataSchema);
