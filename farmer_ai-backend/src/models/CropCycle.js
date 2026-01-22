const mongoose = require('mongoose');

const CropCycleSchema = new mongoose.Schema({
    farm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm',
        required: true,
        index: true
    },
    cropName: {
        type: String,
        required: [true, 'Please add a crop name'],
        trim: true
    },
    // Dates
    sowingDate: {
        type: Date,
        required: [true, 'Please add sowing date']
    },
    expectedHarvestDate: {
        type: Date,
        required: [true, 'Please add expected harvest date']
    },
    actualHarvestDate: {
        type: Date
    },
    // Details
    inputType: {
        type: String,
        enum: ['Organic', 'Chemical', 'Mixed'],
        default: 'Chemical'
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Failed'],
        default: 'Active',
        index: true
    },
    // Yield Data
    yieldPredicted: {
        type: Number, // In kg/tonnes (unit handled by frontend or separate field)
        default: 0
    },
    yieldActual: {
        type: Number,
        default: 0
    },
    // Post-Harvest Tracking
    harvestedQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    marketableQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    wastageQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    estimatedCost: {
        type: Number,
        default: 0
    },
    // Expenses (Simplified for now)
    expenses: [{
        category: String,
        amount: Number,
        date: { type: Date, default: Date.now },
        description: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CropCycle', CropCycleSchema);
