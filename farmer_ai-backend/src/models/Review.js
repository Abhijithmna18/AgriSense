const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        index: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketplaceListing',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        enum: [1, 2, 3, 4, 5]
    },
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    comment: {
        type: String,
        required: true,
        maxlength: 1000
    },
    // Review categories
    productQuality: {
        type: Number,
        min: 1,
        max: 5
    },
    deliveryExperience: {
        type: Number,
        min: 1,
        max: 5
    },
    sellerCommunication: {
        type: Number,
        min: 1,
        max: 5
    },
    // Seller response
    sellerResponse: {
        comment: String,
        respondedAt: Date
    },
    // Helpful votes
    helpfulCount: {
        type: Number,
        default: 0
    },
    unhelpfulCount: {
        type: Number,
        default: 0
    },
    // Verification
    isVerifiedPurchase: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    }
}, {
    timestamps: true
});

// Index for efficient queries
reviewSchema.index({ seller: 1, createdAt: -1 });
reviewSchema.index({ buyer: 1, createdAt: -1 });
reviewSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
