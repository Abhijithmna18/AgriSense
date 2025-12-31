const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
    requestFor: {
        farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true }
    },
    details: {
        cropName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0.1 }, // tons
        startDate: { type: Date, required: true },
        durationDays: { type: Number, required: true, min: 1 },
        endDate: { type: Date } // Calculated
    },
    status: {
        type: String,
        enum: [
            'PENDING',                    // Phase 2: Created by Farmer
            'APPROVED_WAITING_PAYMENT',  // Phase 3: Admin Approved & Priced
            'CONFIRMED',                  // Phase 4: Farmer Accepted & Transport added
            'STORED',                     // Phase 5: Finalized, goods in warehouse
            'COMPLETED',                  // Goods removed
            'REJECTED',
            'CANCELLED'
        ],
        default: 'PENDING',
        required: true
    },
    adminResponse: {
        pricePerTonPerDay: Number,
        totalPrice: Number, // Calculated final price
        notes: String,
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        approvalDate: Date
    },
    transportDetails: {
        driverName: String,
        vehicleNumber: String,
        contactNumber: String,
        expectedArrival: Date
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'PENDING'
    },
    paymentDetails: {
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        amountPaid: Number,
        paymentDate: Date
    },
    auditLog: [
        {
            action: String, // e.g., 'CREATED', 'APPROVED', 'FINALIZED'
            performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now },
            metadata: mongoose.Schema.Types.Mixed
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Calculate endDate before saving if not present
// Calculate endDate before saving if not present
bookingRequestSchema.pre('save', async function () {
    console.log('Running BookingRequest pre-save hook');
    if (this.details.startDate && this.details.durationDays) {
        const start = new Date(this.details.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + this.details.durationDays);
        this.details.endDate = end;
    }
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
