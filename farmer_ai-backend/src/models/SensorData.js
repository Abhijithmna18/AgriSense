const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true,
        index: true
    },
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    metrics: {
        soilMoisture: { type: Number, min: 0, max: 100 },
        temperature: { type: Number },
        humidity: { type: Number, min: 0, max: 100 },
        nitrogen: { type: Number },
        phosphorus: { type: Number },
        potassium: { type: Number }
    },
    pumpStatus: {
        type: String,
        enum: ['ON', 'OFF', 'UNKNOWN'],
        default: 'UNKNOWN'
    }
});

// Compound index for efficient time-series queries per farm
sensorDataSchema.index({ farm: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
