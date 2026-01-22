const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Add a product review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
    try {
        const { vendorName, productName, rating, comment, productId } = req.body;

        const review = await Review.create({
            buyer: req.user._id,
            vendorName: vendorName || 'Unknown Vendor',
            productName: productName || 'Unknown Product',
            product: productId || null, // Optional link to actual Product ID if available
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all reviews (Internal/Admin use or for my-reviews)
// @route   GET /api/reviews
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }).populate('buyer', 'name');
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reviews for a specific product
// @route   GET /api/reviews/product/:productId
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        // Try finding by Product ID first, then maybe fallback (or just return empty if using simple strings)
        const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 }).populate('buyer', 'name');
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching product reviews:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Check if user can review a product
// @route   GET /api/reviews/can-review/:productId
exports.canReviewProduct = async (req, res) => {
    // Mock implementation for now - allow all
    // In real app, check Order history
    res.json({ canReview: true });
};

// @desc    Get logged in user's reviews
// @route   GET /api/reviews/my-reviews
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ buyer: req.user._id }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching my reviews:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Alias addReview to createReview for backward compatibility if needed internally
exports.addReview = exports.createReview;
