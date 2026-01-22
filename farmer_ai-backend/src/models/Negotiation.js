const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MarketplaceListing',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['buyer_initiated', 'vendor_initiated', 'rfq_response'],
        default: 'buyer_initiated',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'expired', 'cancelled'],
        default: 'pending',
        required: true,
        index: true
    },
    baseline: {
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
        deliveryDays: {
            type: Number,
            default: 7
        },
        qualityGrade: {
            type: String,
            default: 'Standard'
        },
        paymentTerms: {
            type: String,
            default: 'Net 30'
        },
        incoterms: {
            type: String
        }
    },
    finalTerms: {
        price: Number,
        quantity: Number,
        deliveryDate: Date,
        qualityRequirements: String,
        packaging: String,
        customization: String
    },
    currentRound: {
        type: Number,
        default: 1,
        min: 1
    },
    maxRounds: {
        type: Number,
        default: 5,
        min: 1,
        max: 10
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    acceptedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    metadata: {
        source: {
            type: String,
            enum: ['product_page', 'rfq', 'order_draft', 'marketplace_search'],
            default: 'product_page'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        tags: [String]
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
negotiationSchema.index({ buyerId: 1, status: 1 });
negotiationSchema.index({ vendorId: 1, status: 1 });
negotiationSchema.index({ productId: 1, status: 1 });
negotiationSchema.index({ expiresAt: 1, status: 1 });

// Auto-expire negotiations
negotiationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for time remaining
negotiationSchema.virtual('timeRemaining').get(function() {
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
});

// Pre-save middleware to handle expiration
negotiationSchema.pre('save', function() {
    if (this.expiresAt && new Date() > this.expiresAt && this.status === 'pending') {
        this.status = 'expired';
    }
});

module.exports = mongoose.model('Negotiation', negotiationSchema);