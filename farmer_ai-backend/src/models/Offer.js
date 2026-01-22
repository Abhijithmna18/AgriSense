const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    negotiationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Negotiation',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['buyer_offer', 'vendor_counteroffer'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending',
        required: true,
        index: true
    },
    // Core offer terms
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    deliveryDate: {
        type: Date
    },
    qualityRequirements: {
        type: String
    },
    packaging: {
        type: String
    },
    customization: {
        type: String
    },
    message: {
        type: String,
        maxlength: 1000
    },
    // Tracking
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    // Acceptance/Rejection tracking
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    acceptedAt: {
        type: Date
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        maxlength: 500
    },
    // Expiration
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        }
    },
    // Metadata
    metadata: {
        priceChangePercentage: Number,
        quantityChangePercentage: Number,
        totalValue: Number,
        isCounterOffer: {
            type: Boolean,
            default: false
        },
        parentOfferId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Offer'
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
offerSchema.index({ negotiationId: 1, timestamp: -1 });
offerSchema.index({ submittedBy: 1, status: 1 });
offerSchema.index({ status: 1, expiresAt: 1 });

// Auto-expire offers
offerSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for calculating total value
offerSchema.virtual('totalValue').get(function() {
    return this.price * this.quantity;
});

// Pre-save middleware to calculate metadata
offerSchema.pre('save', async function() {
    if (this.isNew) {
        // Calculate total value
        this.metadata.totalValue = this.price * this.quantity;
        
        // Get negotiation to calculate percentage changes
        try {
            const Negotiation = mongoose.model('Negotiation');
            const negotiation = await Negotiation.findById(this.negotiationId);
            
            if (negotiation) {
                // Calculate price change percentage
                const priceChange = ((this.price - negotiation.baseline.price) / negotiation.baseline.price) * 100;
                this.metadata.priceChangePercentage = Math.round(priceChange * 100) / 100;
                
                // Calculate quantity change percentage
                const quantityChange = ((this.quantity - negotiation.baseline.quantity) / negotiation.baseline.quantity) * 100;
                this.metadata.quantityChangePercentage = Math.round(quantityChange * 100) / 100;
            }
        } catch (error) {
            console.error('Error calculating offer metadata:', error);
        }
    }
    
    // Handle expiration
    if (this.expiresAt && new Date() > this.expiresAt && this.status === 'pending') {
        this.status = 'expired';
    }
});

module.exports = mongoose.model('Offer', offerSchema);