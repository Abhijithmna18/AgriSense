const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getProductReviews, getMyReviews, getSellerReviews, getVendorReceivedReviews, addSellerResponse, markHelpful, deleteReview } = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/seller/:sellerId', getSellerReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.get('/vendor/received', protect, getVendorReceivedReviews);
router.put('/:reviewId/response', protect, addSellerResponse);
router.put('/:reviewId/helpful', protect, markHelpful);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
