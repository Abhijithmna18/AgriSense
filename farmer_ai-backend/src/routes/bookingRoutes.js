const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createBookingRequest,
    getMyBookings,
    getAllBookings,
    approveBooking,
    addTransportDetails,
    finalizeBooking
} = require('../controllers/bookingController');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');

// Farmer routes
router.post('/', protect, createBookingRequest); // Phase 2
router.get('/my', protect, getMyBookings);
router.put('/:id/transport', protect, addTransportDetails); // Phase 4 (Changed from confirm to transport)
router.post('/:id/payment/order', protect, createPaymentOrder);
router.post('/:id/payment/verify', protect, verifyPayment);

// Admin routes
router.get('/', protect, authorize('admin', 'manager'), getAllBookings); // View all requests
router.put('/:id/approve', protect, authorize('admin'), approveBooking); // Phase 3
router.put('/:id/finalize', protect, authorize('admin'), finalizeBooking); // Phase 5

module.exports = router;
