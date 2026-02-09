const mongoose = require('mongoose');

const pestPredictionSchema = new mongoose.Schema({
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true,
        index: true
    },
    cropCycle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropCycle',
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    zone: String,
    crop: String,
    cropStage: String,
    daysSinceSowing: Number,
    predictionWindow: {
        type: String,
        default: 'next_7_days'
    },
    weatherData: {
        current: {
            temperature: Number,
            humidity: Number,
            rainfall: Number,
            wind: Number
        },
        forecast: [{
            date: Date,
            temperature: Number,
            humidity: Number,
            rainfall: Number
        }]
    },
    pestRisks: [{
        pestName: String,
        riskPercent: Number,
        confidence: Number,
        peakRiskDay: Date,
        reason: String,
        preventiveActions: [{
            action: String,
            type: {
                type: String,
                enum: ['organic', 'chemical', 'cultural', 'biological']
            },
            cost: {
                type: String,
                enum: ['low', 'medium', 'high']
            },
            urgency: {
                type: String,
                enum: ['immediate', 'monitor', 'scheduled']
            },
            impact: String
        }]
    }],
    overallRiskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'archived'],
        default: 'active'
    },
    expiresAt: Date
}, {
    timestamps: true
});

// Index for efficient queries
pestPredictionSchema.index({ user: 1, createdAt: -1 });
pestPredictionSchema.index({ farm: 1, status: 1 });
pestPredictionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PestPrediction', pestPredictionSchema);
