const mongoose = require('mongoose');

const FarmSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Step 1: Basic Identity
    name: {
        type: String,
        required: [true, 'Please add a farm name'],
        trim: true
    },
    totalArea: {
        type: Number,
        required: [true, 'Please add total area'],
        min: [0.1, 'Area must be greater than 0']
    },
    landholdingType: {
        type: String,
        enum: ['Owner', 'Tenant'],
        default: 'Owner'
    },
    irrigationType: {
        type: String,
        enum: ['Rainfed', 'Canal', 'Borewell', 'Drip', 'Sprinkler', 'Other'],
        required: [true, 'Please select irrigation type']
    },

    // Step 2: Location & Geography
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            index: '2dsphere'
        },
        state: { type: String, required: true },
        district: { type: String, required: true },
        village: { type: String, default: '' }
    },

    // Step 3: Soil Information
    soilType: {
        type: String,
        enum: ['Sandy', 'Loamy', 'Clay', 'Black', 'Red', 'Mixed', 'Other'],
        required: [true, 'Please select soil type']
    },
    soilTest: {
        n: { type: Number, default: null }, // Nitrogen
        p: { type: Number, default: null }, // Phosphorus
        k: { type: Number, default: null }, // Potassium
        ph: { type: Number, default: null } // pH Level
    },
    soilDataSource: {
        type: String,
        enum: ['Lab Tested', 'Estimated', 'Unknown'],
        default: 'Unknown'
    },

    // Step 4: Water & Constraints
    waterAvailability: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    waterReliability: {
        type: String,
        enum: ['Stable', 'Uncertain'],
        default: 'Stable'
    },
    hasPowerForIrrigation: {
        type: Boolean,
        default: false
    },

    // Step 5: Historical Crop Data
    cropHistory: [{
        cropName: String,
        sowingDate: Date,
        harvestDate: Date,
        yieldCalculated: Number,
        yieldActual: Number,
        issues: [String] // e.g. ['Pest', 'Drought']
    }],

    images: {
        type: [String],
        default: []
    },

    // AI Readiness
    dataReadinessScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Farm', FarmSchema);
