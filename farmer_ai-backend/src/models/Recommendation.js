const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farmId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    // Snapshot of inputs for historical reference/re-run
    inputs: {
        location: {
            name: String,
            lat: Number,
            lng: Number
        },
        soil: {
            n: Number,
            p: Number,
            k: Number,
            ph: Number,
            organic_c: Number,
            texture: String
        },
        season: String,
        constraints: {
            maxWaterUse: Number,
            minProfitPerHa: Number
        }
    },
    // The top ranked results
    results: [{
        rank: Number,
        cropId: String,
        cropName: String,
        score: Number,
        suitability: Number,
        estimatedYieldKgHa: Number,
        expectedProfitPerHa: Number,
        risk: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        // Soil-based corrections specific to this crop
        soilActions: {
            addNkgHa: Number,
            addPkgHa: Number,
            addKkgHa: Number,
            limeKgHa: Number,
            note: String
        },
        // Explainability data
        explanation: {
            featureContributions: [{
                feature: String,
                contribution: Number
            }],
            ruleMatches: [String]
        }
    }],
    metadata: {
        modelVersion: String,
        datasetUsed: String,
        inferenceTimeMs: Number
    },
    // User feedback loop
    status: {
        type: String,
        enum: ['generated', 'adopted', 'rejected', 'archived'],
        default: 'generated'
    },
    userFeedback: {
        rating: Number, // 1-5
        actualYield: Number,
        comments: String
    }
});

// Index for fast history lookup by user
RecommendationSchema.index({ userId: 1, requestedAt: -1 });

module.exports = mongoose.model('Recommendation', RecommendationSchema);
