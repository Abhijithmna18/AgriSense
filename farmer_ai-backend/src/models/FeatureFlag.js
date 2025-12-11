const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: false
    },
    rolloutPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    targetRoles: [{
        type: String,
        enum: ['user', 'admin', 'farmer', 'expert']
    }],
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
