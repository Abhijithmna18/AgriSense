const mongoose = require('mongoose');
const crypto = require('crypto');

const marketplaceListingSchema = new mongoose.Schema({
    listingId: {
        type: String,
        default: () => crypto.randomUUID(),
        unique: true,
        required: true,
        index: true
    },
    // For custom products without a CropCycle ref
    name: {
        type: String,
        required: false
    },
    variety: {
        type: String,
        required: false
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productType: {
        type: String,
        required: true,
        index: true
    },
    category: {
        type: String,
        enum: ['inputs', 'rentals'],
        required: true,
        default: 'inputs',
        index: true
    },
    productRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropCycle', // STRICT: Only selling from harvested crops for now
        required: false
    },
    originalQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: { // Current Available
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true // e.g., 'kg', 'ton', 'units'
    },
    pricePerUnit: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String, // Simplified for now, could be GeoJSON later
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'cancelled'],
        default: 'active',
        index: true
    },
    description: {
        type: String,
    },
    images: [{
        type: String // URLs
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // created_at, updated_at
});

// Composite Index for Filtering
marketplaceListingSchema.index({ status: 1, productType: 1 });

module.exports = mongoose.model('MarketplaceListing', marketplaceListingSchema);
