const mongoose = require('mongoose');

const DiseaseScanSchema = new mongoose.Schema({
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
    imageUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['detected', 'healthy', 'inconclusive'],
        default: 'inconclusive'
    },
    diseaseName: {
        type: String,
        default: 'Unknown'
    },
    confidence: {
        type: Number,
        default: 0
    },
    severity: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'critical']
    },
    symptoms: [String],
    treatment: {
        organic: [String],
        chemical: [String],
        prevention: [String]
    },
    // Location for Disease Radar
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        }
    },
    scannedAt: {
        type: Date,
        default: Date.now
    }
});

// Create geospatial index
DiseaseScanSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('DiseaseScan', DiseaseScanSchema);
