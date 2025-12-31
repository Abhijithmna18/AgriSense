const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    cropName: {
        type: String,
        required: true
    },
    cropType: {
        type: String,
        enum: ['grain', 'spice', 'vegetable', 'fruit', 'pulses', 'oilseeds', 'other'],
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity in tons is required'],
        min: [0.1, 'Minimum quantity is 0.1 ton']
    },
    duration: {
        type: Number,
        required: [true, 'Duration in days is required'],
        min: [1, 'Minimum duration is 1 day']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    status: {
        type: String,
        enum: [
            'REQUESTED',                // Phase 2: Farmer requests
            'APPROVED_WAITING_PAYMENT', // Phase 3: Admin approves & sets price
            'AWAITING_PAYMENT',         // Phase 4: Farmer accepts & adds transport (Ready for payment)
            'AWAITING_CONFIRMATION',    // Phase 5a: Payment Verified, waiting for admin
            'CONFIRMED',                // Phase 5b: Admin finalizes (Capacity deducted)
            'STORED',                   // Active in warehouse
            'COMPLETED',                // Booking finished
            'REJECTED',                 // Admin rejected
            'CANCELLED'                 // Farmer cancelled
        ],
        default: 'REQUESTED',
        index: true
    },
    pricing: {
        pricePerTonPerDay: Number,
        totalPrice: Number,
        currency: { type: String, default: 'INR' },
        adminNotes: String
    },
    transportDetails: {
        type: { type: String, enum: ['SELF', 'PARTNER'], default: 'SELF' },
        vehicleNumber: String,
        driverName: String,
        driverContact: String,
        expectedArrival: Date
    },
    payment: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        amountPaid: Number,
        status: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
            default: 'PENDING'
        },
        paidAt: Date,
        invoicePath: String
    },
    auditLogs: [{
        action: String, // e.g., 'CREATED', 'APPROVED', 'PAYMENT_VERIFIED'
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        metadata: mongoose.Schema.Types.Mixed
    }],
    storageSlot: String,
    farmerNotes: String,
    requestedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    confirmedAt: Date, // Admin finalized
    finalizedAt: Date, // Legacy support if needed
    cancelledAt: Date
}, {
    timestamps: true
});

// Indexes
BookingSchema.index({ farmerId: 1, status: 1 });
BookingSchema.index({ warehouseId: 1, status: 1 });
BookingSchema.index({ status: 1, requestedAt: -1 });

// Generate booking ID before save
BookingSchema.pre('validate', async function () {
    if (this.isNew && !this.bookingId) {
        const count = await mongoose.model('Booking').countDocuments();
        this.bookingId = `WB${Date.now()}${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
