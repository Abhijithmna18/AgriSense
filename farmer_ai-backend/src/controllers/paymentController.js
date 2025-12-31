const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking'); // Updated model import
const { sendPaymentSuccessEmail } = require('../services/emailService');
const { generateInvoice } = require('../services/invoiceGenerator');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/bookings/:id/payment/order
// @access  Private (Farmer)
exports.createPaymentOrder = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Verify ownership and status
        if (booking.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (booking.status !== 'AWAITING_PAYMENT') {
            return res.status(400).json({ success: false, message: 'Booking is not ready for payment' });
        }

        // Check if duration is being updated
        if (req.body.newDuration) {
            const newDuration = parseInt(req.body.newDuration);
            if (newDuration > 0 && newDuration !== booking.duration) {
                // Recalculate based on Price Per Ton Per Day (set by Admin)
                // If admin didn't set per-ton-day price in the notes or metadata, we rely on the saved pricing object.
                // We should have stored 'pricePerTonPerDay' in booking.pricing during approval.

                if (booking.pricing && booking.pricing.pricePerTonPerDay) {
                    booking.duration = newDuration;
                    booking.pricing.totalPrice = booking.pricing.pricePerTonPerDay * booking.quantity * newDuration;

                    // Add audit log for change
                    booking.auditLogs.push({
                        action: 'DURATION_UPDATED',
                        performedBy: req.user.id,
                        metadata: { newDuration, oldDuration: booking.duration, newTotal: booking.pricing.totalPrice }
                    });
                }
            }
        }

        const amount = booking.pricing.totalPrice;

        // Limit Check (Razorpay/UPI request)
        if (amount > 50000) {
            return res.status(400).json({
                success: false,
                message: `Payment amount (₹${amount}) exceeds the UPI limit of ₹50,000. Please contact admin.`
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay works in paise, rounding for safety
            currency: 'INR',
            receipt: `receipt_${booking._id}`,
            notes: {
                bookingId: booking._id.toString()
            }
        };

        const order = await razorpay.orders.create(options);

        // Update booking with Order ID and potentially new pricing
        booking.payment.razorpayOrderId = order.id;
        await booking.save();

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: options.amount,
            currency: options.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/bookings/:id/payment/verify
// @access  Private (Farmer)
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Verify Signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            booking.payment.status = 'FAILED';
            await booking.save();
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

        // Payment Successful
        booking.payment.razorpayPaymentId = razorpay_payment_id;
        booking.payment.razorpaySignature = razorpay_signature;
        booking.payment.amountPaid = booking.pricing.totalPrice; // Or fetch from order
        booking.payment.status = 'COMPLETED';
        booking.payment.paidAt = Date.now();

        // Move to Phase 5a: Awaiting Admin Confirmation/Finalization
        booking.status = 'AWAITING_CONFIRMATION';

        booking.auditLogs.push({
            action: 'PAYMENT_COMPLETED',
            performedBy: req.user.id,
            metadata: { paymentId: razorpay_payment_id }
        });

        await booking.save();

        // Generate Invoice & Send Email (Async)
        try {
            const fullBooking = await Booking.findById(booking._id)
                .populate('farmerId')
                .populate('warehouseId');

            if (fullBooking && fullBooking.farmerId && fullBooking.warehouseId) {
                const invoicePath = await generateInvoice(fullBooking, fullBooking.farmerId, fullBooking.warehouseId);

                // Save invoice path relative to uploads
                // Invoice path from generator is absolute, we might want relative for DB or just use it for email
                // Let's store relative path 'uploads/invoices/FILENAME'
                const relativePath = 'uploads/invoices/' + require('path').basename(invoicePath);

                fullBooking.payment.invoicePath = relativePath;
                await fullBooking.save();

                await sendPaymentSuccessEmail(fullBooking, fullBooking.farmerId, invoicePath);
            }
        } catch (e) {
            console.error("Invoice/Email failed", e);
        }

        res.status(200).json({ success: true, message: 'Payment verified successfully. Awaiting final confirmation.' });

    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
};
