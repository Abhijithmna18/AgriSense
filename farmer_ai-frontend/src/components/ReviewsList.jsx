import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/authApi';

const ReviewsList = ({ productId, sellerId, isVendor = false, onReviewDeleted }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState('recent');
    const [pagination, setPagination] = useState(null);
    const [expandedReviews, setExpandedReviews] = useState({});
    const [responseText, setResponseText] = useState({});
    const [respondingTo, setRespondingTo] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [page, sortBy, productId, sellerId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            let url;
            if (productId) {
                url = `/api/reviews/product/${productId}?page=${page}&sortBy=${sortBy}`;
            } else if (sellerId) {
                url = `/api/reviews/seller/${sellerId}?page=${page}&sortBy=${sortBy}`;
            } else {
                setLoading(false);
                return; // No productId or sellerId provided
            }

            const { data } = await api.get(url);
            setReviews(data.reviews);
            setStats(data.stats);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkHelpful = async (reviewId, helpful) => {
        try {
            await api.put(`/api/reviews/${reviewId}/helpful`, { helpful });
            fetchReviews();
            toast.success('Thank you for your feedback');
        } catch (error) {
            toast.error('Failed to mark review');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            await api.delete(`/api/reviews/${reviewId}`);
            toast.success('Review deleted successfully');
            fetchReviews();
            onReviewDeleted?.();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const handleAddResponse = async (reviewId) => {
        if (!responseText[reviewId]?.trim()) {
            toast.error('Please enter a response');
            return;
        }

        try {
            await api.put(`/api/reviews/${reviewId}/response`, {
                comment: responseText[reviewId]
            });
            toast.success('Response added successfully');
            setResponseText({ ...responseText, [reviewId]: '' });
            setRespondingTo(null);
            fetchReviews();
        } catch (error) {
            toast.error('Failed to add response');
        }
    };

    const RatingStars = ({ rating }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    size={16}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
            ))}
        </div>
    );

    const RatingBar = ({ label, value, max = 5 }) => (
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-32">{label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(value / max) * 100}%` }}
                />
            </div>
            <span className="text-sm font-medium text-gray-700 w-8">{value.toFixed(1)}</span>
        </div>
    );

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading reviews...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats Section */}
            {stats && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
                            <p className="text-sm text-gray-500 mt-1">{stats.totalReviews} verified reviews</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">{stats.avgRating}</div>
                            <RatingStars rating={Math.round(stats.avgRating)} />
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 w-12">{rating} ★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{ width: `${(stats.distribution[rating] / stats.totalReviews) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">
                                    {stats.distribution[rating]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Ratings */}
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <RatingBar label="Product Quality" value={stats.avgQuality} />
                        <RatingBar label="Delivery Experience" value={stats.avgDelivery} />
                        <RatingBar label="Seller Communication" value={stats.avgCommunication} />
                    </div>
                </div>
            )}

            {/* Sort Options */}
            <div className="flex gap-3">
                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                >
                    <option value="recent">Most Recent</option>
                    <option value="rating-high">Highest Rating</option>
                    <option value="rating-low">Lowest Rating</option>
                    <option value="helpful">Most Helpful</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">No reviews yet</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review._id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                            {/* Review Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-green-700">
                                                {review.buyer.firstName[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {review.buyer.firstName} {review.buyer.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <RatingStars rating={review.rating} />
                                </div>
                                {review.isVerifiedPurchase && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        ✓ Verified Purchase
                                    </span>
                                )}
                            </div>

                            {/* Review Title & Comment */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                                <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                            </div>

                            {/* Detailed Ratings */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Product Quality:</span>
                                    <span className="font-medium text-gray-900">{review.productQuality}/5</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Experience:</span>
                                    <span className="font-medium text-gray-900">{review.deliveryExperience}/5</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Seller Communication:</span>
                                    <span className="font-medium text-gray-900">{review.sellerCommunication}/5</span>
                                </div>
                            </div>

                            {/* Seller Response */}
                            {review.sellerResponse && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-xs font-medium text-blue-700 mb-2">Seller Response</p>
                                    <p className="text-sm text-blue-900">{review.sellerResponse.comment}</p>
                                    <p className="text-xs text-blue-600 mt-2">
                                        {new Date(review.sellerResponse.respondedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {/* Response Form (for vendor) */}
                            {isVendor && !review.sellerResponse && respondingTo === review._id && (
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <textarea
                                        value={responseText[review._id] || ''}
                                        onChange={(e) => setResponseText({ ...responseText, [review._id]: e.target.value })}
                                        placeholder="Write your response to this review..."
                                        rows={3}
                                        maxLength={500}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddResponse(review._id)}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                                        >
                                            Post Response
                                        </button>
                                        <button
                                            onClick={() => setRespondingTo(null)}
                                            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleMarkHelpful(review._id, true)}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition"
                                    >
                                        <ThumbsUp size={16} />
                                        Helpful ({review.helpfulCount})
                                    </button>
                                    <button
                                        onClick={() => handleMarkHelpful(review._id, false)}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
                                    >
                                        <ThumbsDown size={16} />
                                        Not Helpful ({review.unhelpfulCount})
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    {isVendor && !review.sellerResponse && (
                                        <button
                                            onClick={() => setRespondingTo(respondingTo === review._id ? null : review._id)}
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition"
                                        >
                                            <MessageCircle size={16} />
                                            Respond
                                        </button>
                                    )}
                                    {!isVendor && (
                                        <button
                                            onClick={() => handleDeleteReview(review._id)}
                                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-2 rounded-lg ${
                                    page === p
                                        ? 'bg-green-600 text-white'
                                        : 'border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                        disabled={page === pagination.pages}
                        className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewsList;
