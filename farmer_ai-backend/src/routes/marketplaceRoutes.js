const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProducts, createOrder, VerifyPayment, getMyOrders, createProduct, updateProduct, deleteProduct, getMyListings, getVendorOrders, updateOrderStatus, getMarketAnalytics, getVendorAnalyticsSpecific, getVendorPayments, getVendorReviews, replyToReview, verifyPayment, getOrderById, getOrderInvoice, cancelOrder } = require('../controllers/marketplaceController');
const { saveSupplier, getSavedSuppliers, checkSavedSupplier, removeSavedSupplier } = require('../controllers/savedSuppliersController');

// All routes are protected - accessible to farmers, buyers, and admins
router.use(protect);

router.get('/products', authorize('farmer', 'buyer', 'admin', 'vendor'), getProducts);
router.post('/order', authorize('farmer', 'buyer', 'admin', 'vendor'), createOrder);
router.post('/verify-payment', authorize('farmer', 'buyer', 'admin', 'vendor'), verifyPayment);
router.get('/orders', authorize('farmer', 'buyer', 'admin', 'vendor'), getMyOrders);
router.get('/orders/:id', authorize('farmer', 'buyer', 'admin', 'vendor'), getOrderById);
router.post('/orders/:id/cancel', authorize('farmer', 'buyer', 'admin'), cancelOrder);
router.get('/orders/:id/invoice', authorize('farmer', 'buyer', 'admin', 'vendor'), getOrderInvoice);
router.get('/analytics', authorize('farmer', 'buyer', 'admin', 'vendor'), getMarketAnalytics);


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Images only (jpeg, jpg, png, webp)!'));
    }
});

// Product Management (Farmers & Vendors)
router.post('/products', authorize('farmer', 'vendor', 'admin'), upload.array('images', 5), createProduct);
router.get('/my-listings', authorize('farmer', 'vendor', 'admin'), getMyListings);
router.put('/products/:id', authorize('farmer', 'vendor', 'admin'), upload.array('images', 5), updateProduct);
router.delete('/products/:id', authorize('farmer', 'vendor', 'admin'), deleteProduct);

// Vendor Order Management
router.get('/vendor/orders', authorize('vendor', 'admin'), getVendorOrders);
router.put('/order/:id/status', authorize('vendor', 'admin'), updateOrderStatus);
// Vendor Analytics & Payments
router.get('/vendor/analytics-specific', authorize('vendor', 'admin'), getVendorAnalyticsSpecific); // Renamed to avoid collision
router.get('/vendor/payments', authorize('vendor', 'admin'), getVendorPayments);

// Reviews (Vendor)
router.get('/vendor/reviews', authorize('vendor', 'admin'), getVendorReviews);
router.post('/reviews/:id/reply', authorize('vendor', 'admin'), replyToReview);

// Saved Suppliers (Buyer)
router.post('/saved-suppliers', authorize('buyer', 'farmer', 'admin'), saveSupplier);
router.get('/saved-suppliers', authorize('buyer', 'farmer', 'admin'), getSavedSuppliers);
router.get('/saved-suppliers/check/:supplierId', authorize('buyer', 'farmer', 'admin'), checkSavedSupplier);
router.delete('/saved-suppliers/:supplierId', authorize('buyer', 'farmer', 'admin'), removeSavedSupplier);

module.exports = router;
