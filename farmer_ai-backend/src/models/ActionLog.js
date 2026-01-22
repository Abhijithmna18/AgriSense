const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
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
    // polymorphic reference to what was acted upon
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    entityType: {
        type: String,
        required: true, // e.g., 'Recommendation', 'Alert', 'PlantIdentification'
        enum: ['Recommendation', 'Alert', 'Observation', 'CropCycle']
    },
    action: {
        type: String,
        enum: ['Viewed', 'Followed', 'Ignored', 'Overridden'],
        required: true
    },
    userOverrideReason: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActionLog', ActionLogSchema);
