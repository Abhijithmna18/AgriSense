const mongoose = require('mongoose');

/**
 * WeatherAlert Model
 * Tracks weather alerts sent to farmers to prevent spam and maintain history
 */
const WeatherAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm'
    },
    alertType: {
        type: String,
        enum: ['frost', 'heavy_rain', 'drought_risk', 'extreme_heat', 'strong_wind', 'high_humidity', 'high_uv'],
        required: true
    },
    severity: {
        type: String,
        enum: ['info', 'warning', 'danger'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    weatherData: {
        temperature: Number,
        rainfall: Number,
        humidity: Number,
        windSpeed: Number,
        uvIndex: Number
    },
    location: {
        city: String,
        coordinates: [Number] // [longitude, latitude]
    },
    sentAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Compound index for cooldown checks
WeatherAlertSchema.index({ user: 1, alertType: 1, sentAt: -1 });

// Auto-delete alerts older than 30 days
WeatherAlertSchema.index({ sentAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('WeatherAlert', WeatherAlertSchema);
