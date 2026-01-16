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
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productType: {
        type: String,
        enum: ['crop', 'livestock', 'input', 'rent', 'machinery'],
        required: true
    },
    productRef: {
        type: mongoose.Schema.Types.Mixed, // Can be crop_id or SKU JSON
        required: true
    },
    quantity: {
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
