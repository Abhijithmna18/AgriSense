const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    getListings,
    createListing,
    updateListing,
    getOrders,
    updateOrderStatus,
    getPayments,
    verifyPayment,
    getStats
} = require('../controllers/adminMarketplaceController');

// All routes are protected and admin-only
router.use(protect);
router.use(adminOnly);

// Listings
router.get('/listings', getListings);
router.post('/listings', createListing);
router.put('/listings/:id', updateListing);

// Orders
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Payments
router.get('/payments', getPayments);
router.put('/payments/:id/verify', verifyPayment);

// Stats
router.get('/stats', getStats);

module.exports = router;
