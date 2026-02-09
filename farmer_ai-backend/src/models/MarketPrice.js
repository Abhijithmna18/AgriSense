const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    crop: {
        type: String,
        required: true,
        index: true,
        lowercase: true,
        trim: true
    },
    market: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
        default: 'quintal' // 100kg
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    currency: {
        type: String,
        default: 'INR'
    }
}, {
    timestamps: true
});

// Compound index for quick lookups
marketPriceSchema.index({ crop: 1, date: -1 });
marketPriceSchema.index({ location: 1, crop: 1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
