const mongoose = require('mongoose');

const FarmInsightSchema = new mongoose.Schema({
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cropCycle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropCycle',
        default: null
    },
    type: {
        type: String,
        enum: ['health', 'yield', 'pest', 'irrigation', 'market'],
        required: true
    },
    // Generic score for the insight (0-100 for health, confidence% for yield, etc.)
    score: { type: Number },
    summary: { type: String },
    // Full AI response payload
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    // Contextual snapshot of what data was used to generate this
    inputSnapshot: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true }
}, {
    timestamps: true
});

// Index to quickly get latest insight per farm per type
FarmInsightSchema.index({ farm: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('FarmInsight', FarmInsightSchema);
