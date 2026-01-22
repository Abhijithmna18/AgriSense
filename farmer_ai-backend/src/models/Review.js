const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendorName: { // Storing name directly for MVP or reference to User if vendors are users
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    // Optional link to Product model for integration with Marketplace
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: false
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
