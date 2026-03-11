const mongoose = require('mongoose');

const SoilTestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true
    },
    plotName: {
        type: String,
        default: 'Main Field'
    },
    testDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    labName: {
        type: String,
        default: 'Self Test'
    },
    // Macronutrients (in mg/kg or ppm)
    ph: {
        type: Number,
        required: true
    },
    nitrogen: { // mg/kg or ppm (will be converted to kg/acre for calculations)
        type: Number,
        required: true
    },
    phosphorus: { // mg/kg or ppm
        type: Number,
        required: true
    },
    potassium: { // mg/kg or ppm
        type: Number,
        required: true
    },
    organicCarbon: { // %
        type: Number
    },
    // Micronutrients (Optional)
    sulfur: Number,
    zinc: Number,
    boron: Number,
    iron: Number,
    manganese: Number,
    copper: Number,

    // Calculated Recommendations (Snapshot)
    recommendations: {
        limeKgHa: { type: Number, default: 0 },
        ureaKgHa: { type: Number, default: 0 }, // Derived from N
        dapKgHa: { type: Number, default: 0 },  // Derived from P
        mopKgHa: { type: Number, default: 0 },  // Derived from K
        notes: [String]
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for unique tests per date/farm if needed, or just indexing for search
SoilTestSchema.index({ farm: 1, testDate: -1 });

module.exports = mongoose.model('SoilTest', SoilTestSchema);
