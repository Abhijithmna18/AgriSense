const mongoose = require('mongoose');

/**
 * IrrigationEpisode — logs each RL agent decision for research data collection.
 * This is the primary data model for research paper analysis.
 * Captures state, action, and reward for every day of a growing season.
 */
const irrigationEpisodeSchema = new mongoose.Schema({
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    cropCycle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropCycle',
        index: true
    },
    agent: {
        type: String,
        enum: ['q_learning', 'ppo'],
        required: true,
        default: 'q_learning'
    },
    // State vector sent to the RL agent
    state: {
        soilMoisturePct: { type: Number, min: 0, max: 1 },
        temperatureNorm: { type: Number, min: 0, max: 1 },
        humidityNorm: { type: Number, min: 0, max: 1 },
        rainfallNorm: { type: Number, min: 0, max: 1 },
        growthStage: { type: Number, min: 0, max: 1 },
        et0Norm: { type: Number, min: 0, max: 1 },
        waterAvailability: { type: Number, min: 0, max: 1 }
    },
    // Action taken by the agent
    action: { type: Number, enum: [0, 1, 2, 3] },
    actionLabel: { type: String },   // "No Irrigation", "Irrigate 10mm", etc.
    irrigationMm: { type: Number, default: 0 },
    confidence: { type: Number, min: 0, max: 1 },
    reasoning: { type: String },

    // Reward components (for research analysis)
    reward: { type: Number },

    // Episode-level outcome fields (set when episode ends)
    episodeComplete: { type: Boolean, default: false },
    totalWaterUsedMm: Number,
    stressDays: Number,
    yieldScore: Number,
    waterEfficiency: Number,

    // Day within the 120-day season
    dayInSeason: { type: Number, min: 0, max: 120 }

}, { timestamps: true });

irrigationEpisodeSchema.index({ farm: 1, createdAt: -1 });
irrigationEpisodeSchema.index({ user: 1, agent: 1 });

module.exports = mongoose.model('IrrigationEpisode', irrigationEpisodeSchema);
