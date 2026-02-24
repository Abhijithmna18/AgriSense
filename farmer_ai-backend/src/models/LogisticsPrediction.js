const mongoose = require('mongoose');

const logisticsPredictionSchema = new mongoose.Schema({
    predictionId: {
        type: String,
        required: true,
        unique: true,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketplaceListing',
        required: true
    },
    inputSnapshot: {
        distanceKm: Number,
        estimatedTransitHours: Number,
        forecastAvgTemp: Number,
        forecastRainProbability: Number,
        forecastHumidity: Number,
        trafficDelayProbability: Number,
        cropPerishabilityIndex: Number,
        cropOptimalTempStart: Number,
        cropOptimalTempEnd: Number
    },
    predictedEta: {
        type: Date,
        required: true
    },
    spoilageRiskPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    recommendation: {
        coldChainRequired: Boolean,
        suggestedTransport: {
            type: String,
            enum: ['Normal', 'Refrigerated', 'Express Refrigerated']
        },
        bufferTimeHours: Number,
        reasoning: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LogisticsPrediction', logisticsPredictionSchema);
