const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    isEnabled: {
        type: Boolean,
        default: false
    },
    environment: {
        type: String,
        enum: ['production', 'staging', 'development', 'all'],
        default: 'production'
    },
    rolloutPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
    },
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    targetRoles: [{
        type: String,
        enum: ['farmer', 'buyer', 'admin', 'vendor']
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated on save
featureFlagSchema.pre('save', function() {
    this.lastUpdated = Date.now();
});

// Index for faster queries
featureFlagSchema.index({ key: 1 });
featureFlagSchema.index({ isEnabled: 1 });
featureFlagSchema.index({ environment: 1 });

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
