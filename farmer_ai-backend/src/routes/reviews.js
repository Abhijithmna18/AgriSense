const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/seller/:sellerId', reviewController.getSellerReviews);

// Protected routes
router.post('/', protect, reviewController.createReview);
router.get('/my-reviews', protect, reviewController.getMyReviews);
router.get('/vendor/received', protect, reviewController.getVendorReceivedReviews);
router.put('/:reviewId/response', protect, reviewController.addSellerResponse);
router.put('/:reviewId/helpful', protect, reviewController.markHelpful);
router.delete('/:reviewId', protect, reviewController.deleteReview);

module.exports = router;
