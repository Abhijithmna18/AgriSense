const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    branchId: {
        type: String,
        required: [true, 'Branch ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Warehouse name is required'],
        trim: true
    },
    location: {
        address: String,
        city: { type: String, required: true },
        state: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    capacity: {
        total: { type: Number, required: true, min: 0 }, // in tons
        available: { type: Number, required: true, min: 0 } // in tons
    },
    specifications: {
        type: {
            type: String,
            enum: ['Dry', 'Cold Storage', 'Frozen', 'Silo'],
            required: true
        },
        supportedCrops: [{ type: String }], // e.g., 'Wheat', 'Rice', 'Potato'
        facilities: [{ type: String }] // e.g., 'CCTV', '24/7 Access', 'Insurance'
    },
    pricing: {
        basePricePerTon: { type: Number, required: true } // Daily rate
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
        default: 'ACTIVE'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin or specific warehouse manager
        required: true
    },
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for geo-location searching if needed strictly, or simple filtering
warehouseSchema.index({ 'location.city': 1, 'location.state': 1 });
warehouseSchema.index({ 'specifications.supportedCrops': 1 });

module.exports = mongoose.model('Warehouse', warehouseSchema);
