const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProducts, createOrder, VerifyPayment, getMyOrders, createProduct, updateProduct, deleteProduct, getMyListings, getVendorOrders, updateOrderStatus, getMarketAnalytics, getVendorAnalyticsSpecific, getVendorPayments, getVendorReviews, replyToReview, verifyPayment } = require('../controllers/marketplaceController');

// All routes are protected - accessible to farmers, buyers, and admins
router.use(protect);

router.get('/products', authorize('farmer', 'buyer', 'admin', 'vendor'), getProducts);
router.post('/order', authorize('farmer', 'buyer', 'admin', 'vendor'), createOrder);
router.post('/verify-payment', authorize('farmer', 'buyer', 'admin', 'vendor'), verifyPayment);
router.get('/orders', authorize('farmer', 'buyer', 'admin', 'vendor'), getMyOrders);
router.get('/analytics', authorize('farmer', 'buyer', 'admin', 'vendor'), getMarketAnalytics);

// Product Management (Farmers & Vendors)
router.post('/products', authorize('farmer', 'vendor', 'admin'), createProduct);
router.get('/my-listings', authorize('farmer', 'vendor', 'admin'), getMyListings);
router.put('/products/:id', authorize('farmer', 'vendor', 'admin'), updateProduct);
router.delete('/products/:id', authorize('farmer', 'vendor', 'admin'), deleteProduct);

// Vendor Order Management
router.get('/vendor/orders', authorize('vendor', 'admin'), getVendorOrders);
router.put('/order/:id/status', authorize('vendor', 'admin'), updateOrderStatus);
// Vendor Analytics & Payments
router.get('/vendor/analytics-specific', authorize('vendor', 'admin'), getVendorAnalyticsSpecific); // Renamed to avoid collision
router.get('/vendor/payments', authorize('vendor', 'admin'), getVendorPayments);

// Reviews
router.get('/vendor/reviews', authorize('vendor', 'admin'), getVendorReviews);
router.post('/reviews/:id/reply', authorize('vendor', 'admin'), replyToReview);

module.exports = router;
