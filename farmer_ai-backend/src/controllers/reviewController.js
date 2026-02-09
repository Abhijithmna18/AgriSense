const Review = require('../models/Review');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (Buyer)
exports.createReview = async (req, res, next) => {
    try {
        const { orderId, productId, rating, title, comment, productQuality, deliveryExperience, sellerCommunication } = req.body;

        // Validate order exists and user is the buyer
        const order = await Order.findById(orderId);
        if (!order) {
            throw new AppError('Order not found', 404);
        }

        if (order.buyer.toString() !== req.user._id.toString()) {
            throw new AppError('Only the buyer can review this order', 403);
        }

        // Check if order is delivered
        if (order.deliveryStatus !== 'delivered' && order.state !== 'DELIVERED') {
            throw new AppError('Can only review delivered orders', 400);
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ order: orderId, buyer: req.user._id });
        if (existingReview) {
            throw new AppError('You have already reviewed this order', 400);
        }

        // Create review
        const review = new Review({
            order: orderId,
            buyer: req.user._id,
            seller: order.seller,
            product: productId,
            rating,
            title,
            comment,
            productQuality: productQuality || rating,
            deliveryExperience: deliveryExperience || rating,
            sellerCommunication: sellerCommunication || rating,
            isVerifiedPurchase: true
        });

        await review.save();
        await review.populate('buyer', 'firstName lastName');
        await review.populate('seller', 'firstName lastName vendorProfile.businessName');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

        let sortOption = { createdAt: -1 };
        if (sortBy === 'rating-high') sortOption = { rating: -1 };
        if (sortBy === 'rating-low') sortOption = { rating: 1 };
        if (sortBy === 'helpful') sortOption = { helpfulCount: -1 };

        const skip = (page - 1) * limit;

        // Get reviews - don't filter by status to show all reviews
        const reviews = await Review.find({ product: productId })
            .populate('buyer', 'firstName lastName')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ product: productId });

        // Calculate average ratings
        let stats = null;
        if (total > 0) {
            try {
                const statsResult = await Review.aggregate([
                    { $match: { product: new mongoose.Types.ObjectId(productId) } },
                    {
                        $group: {
                            _id: null,
                            avgRating: { $avg: '$rating' },
                            avgQuality: { $avg: '$productQuality' },
                            avgDelivery: { $avg: '$deliveryExperience' },
                            avgCommunication: { $avg: '$sellerCommunication' },
                            totalReviews: { $sum: 1 },
                            ratingDistribution: {
                                $push: '$rating'
                            }
                        }
                    }
                ]);

                // Calculate rating distribution
                const distribution = {
                    5: 0,
                    4: 0,
                    3: 0,
                    2: 0,
                    1: 0
                };

                if (statsResult[0]) {
                    statsResult[0].ratingDistribution.forEach(rating => {
                        distribution[rating]++;
                    });

                    stats = {
                        avgRating: parseFloat(statsResult[0].avgRating.toFixed(1)),
                        avgQuality: parseFloat(statsResult[0].avgQuality.toFixed(1)),
                        avgDelivery: parseFloat(statsResult[0].avgDelivery.toFixed(1)),
                        avgCommunication: parseFloat(statsResult[0].avgCommunication.toFixed(1)),
                        totalReviews: statsResult[0].totalReviews,
                        distribution
                    };
                }
            } catch (aggError) {
                console.error('Aggregation error:', aggError);
                // Continue without stats if aggregation fails
            }
        }

        res.json({
            success: true,
            reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            stats
        });
    } catch (error) {
        console.error('Get Product Reviews Error:', error);
        next(error);
    }
};

// @desc    Get reviews for a seller
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
exports.getSellerReviews = async (req, res, next) => {
    try {
        const { sellerId } = req.params;
        const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

        let sortOption = { createdAt: -1 };
        if (sortBy === 'rating-high') sortOption = { rating: -1 };
        if (sortBy === 'rating-low') sortOption = { rating: 1 };
        if (sortBy === 'helpful') sortOption = { helpfulCount: -1 };

        const skip = (page - 1) * limit;

        // Get reviews - don't filter by status
        const reviews = await Review.find({ seller: sellerId })
            .populate('buyer', 'firstName lastName')
            .populate('product', 'name productType')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ seller: sellerId });

        // Calculate average ratings
        let stats = null;
        if (total > 0) {
            try {
                const statsResult = await Review.aggregate([
                    { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
                    {
                        $group: {
                            _id: null,
                            avgRating: { $avg: '$rating' },
                            avgQuality: { $avg: '$productQuality' },
                            avgDelivery: { $avg: '$deliveryExperience' },
                            avgCommunication: { $avg: '$sellerCommunication' },
                            totalReviews: { $sum: 1 },
                            ratingDistribution: {
                                $push: '$rating'
                            }
                        }
                    }
                ]);

                // Calculate rating distribution
                const distribution = {
                    5: 0,
                    4: 0,
                    3: 0,
                    2: 0,
                    1: 0
                };

                if (statsResult[0]) {
                    statsResult[0].ratingDistribution.forEach(rating => {
                        distribution[rating]++;
                    });

                    stats = {
                        avgRating: parseFloat(statsResult[0].avgRating.toFixed(1)),
                        avgQuality: parseFloat(statsResult[0].avgQuality.toFixed(1)),
                        avgDelivery: parseFloat(statsResult[0].avgDelivery.toFixed(1)),
                        avgCommunication: parseFloat(statsResult[0].avgCommunication.toFixed(1)),
                        totalReviews: statsResult[0].totalReviews,
                        distribution
                    };
                }
            } catch (aggError) {
                console.error('Aggregation error:', aggError);
                // Continue without stats if aggregation fails
            }
        }

        res.json({
            success: true,
            reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            stats
        });
    } catch (error) {
        console.error('Get Seller Reviews Error:', error);
        next(error);
    }
};

// @desc    Get buyer's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private (Buyer)
exports.getMyReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ buyer: req.user._id })
            .populate('seller', 'firstName lastName vendorProfile.businessName')
            .populate('product', 'name productType')
            .populate('order', 'orderNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ buyer: req.user._id });

        res.json({
            success: true,
            reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor's received reviews
// @route   GET /api/reviews/vendor/received
// @access  Private (Vendor)
exports.getVendorReceivedReviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

        let sortOption = { createdAt: -1 };
        if (sortBy === 'rating-high') sortOption = { rating: -1 };
        if (sortBy === 'rating-low') sortOption = { rating: 1 };

        const skip = (page - 1) * limit;

        const reviews = await Review.find({ seller: req.user._id })
            .populate('buyer', 'firstName lastName')
            .populate('product', 'name productType')
            .populate('order', 'orderNumber')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ seller: req.user._id });

        // Calculate stats
        const stats = await Review.aggregate([
            { $match: { seller: new mongoose.Types.ObjectId(req.user._id) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    avgQuality: { $avg: '$productQuality' },
                    avgDelivery: { $avg: '$deliveryExperience' },
                    avgCommunication: { $avg: '$sellerCommunication' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            reviews,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            stats: stats[0] ? {
                avgRating: parseFloat(stats[0].avgRating.toFixed(1)),
                avgQuality: parseFloat(stats[0].avgQuality.toFixed(1)),
                avgDelivery: parseFloat(stats[0].avgDelivery.toFixed(1)),
                avgCommunication: parseFloat(stats[0].avgCommunication.toFixed(1)),
                totalReviews: stats[0].totalReviews
            } : null
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add seller response to review
// @route   PUT /api/reviews/:reviewId/response
// @access  Private (Seller)
exports.addSellerResponse = async (req, res, next) => {
    try {
        const { comment } = req.body;
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            throw new AppError('Review not found', 404);
        }

        if (review.seller.toString() !== req.user._id.toString()) {
            throw new AppError('Only the seller can respond to this review', 403);
        }

        review.sellerResponse = {
            comment,
            respondedAt: new Date()
        };

        await review.save();
        await review.populate('buyer', 'firstName lastName');

        res.json({
            success: true,
            message: 'Response added successfully',
            review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:reviewId/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
    try {
        const { helpful } = req.body; // true for helpful, false for unhelpful

        const review = await Review.findById(req.params.reviewId);
        if (!review) {
            throw new AppError('Review not found', 404);
        }

        if (helpful) {
            review.helpfulCount += 1;
        } else {
            review.unhelpfulCount += 1;
        }

        await review.save();

        res.json({
            success: true,
            message: 'Thank you for your feedback',
            review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete review (buyer only)
// @route   DELETE /api/reviews/:reviewId
// @access  Private (Buyer)
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            throw new AppError('Review not found', 404);
        }

        if (review.buyer.toString() !== req.user._id.toString()) {
            throw new AppError('Only the reviewer can delete this review', 403);
        }

        await Review.findByIdAndDelete(req.params.reviewId);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
