import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MessageCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/authApi';
import ReviewsList from '../../components/ReviewsList';

const VendorReviews = () => {
    const navigate = useNavigate();
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
        fetchVendorReviews();
    }, [page, sortBy]);

    const fetchVendorReviews = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/reviews/vendor/received?page=${page}&sortBy=${sortBy}`);
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
            fetchVendorReviews();
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
            <span className="text-sm text-gray-600 w-40">{label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(value / max) * 100}%` }}
                />
            </div>
            <span className="text-sm font-medium text-gray-700 w-8">{value.toFixed(1)}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
                        <p className="text-gray-500 mt-2">Manage and respond to customer feedback</p>
                    </div>
                    <button
                        onClick={() => navigate('/vendor/dashboard')}
                        className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Average Rating</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgRating}</p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg">
                                    <Star size={24} className="text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Reviews</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalReviews}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <MessageCircle size={24} className="text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Product Quality</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgQuality.toFixed(1)}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <TrendingUp size={24} className="text-green-500" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Delivery Rating</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgDelivery.toFixed(1)}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <TrendingUp size={24} className="text-purple-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Stats */}
                {stats && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900">Performance Metrics</h2>
                        <div className="space-y-4">
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
                    </select>
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">No reviews yet</p>
                        <p className="text-gray-400 text-sm mt-2">Reviews from customers will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map(review => (
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
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        ✓ Verified Purchase
                                    </span>
                                </div>

                                {/* Review Content */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                                    <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                                </div>

                                {/* Product Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Product:</span> {review.product?.name || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">Order:</span> {review.order?.orderNumber || 'N/A'}
                                    </p>
                                </div>

                                {/* Detailed Ratings */}
                                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-600">Product Quality:</span>
                                        <span className="font-medium text-blue-900">{review.productQuality}/5</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-600">Delivery Experience:</span>
                                        <span className="font-medium text-blue-900">{review.deliveryExperience}/5</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-blue-600">Seller Communication:</span>
                                        <span className="font-medium text-blue-900">{review.sellerCommunication}/5</span>
                                    </div>
                                </div>

                                {/* Seller Response */}
                                {review.sellerResponse && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-xs font-medium text-green-700 mb-2">Your Response</p>
                                        <p className="text-sm text-green-900">{review.sellerResponse.comment}</p>
                                        <p className="text-xs text-green-600 mt-2">
                                            {new Date(review.sellerResponse.respondedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {/* Response Form */}
                                {!review.sellerResponse && respondingTo === review._id && (
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

                                {/* Response Button */}
                                {!review.sellerResponse && respondingTo !== review._id && (
                                    <button
                                        onClick={() => setRespondingTo(review._id)}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                                    >
                                        <MessageCircle size={16} />
                                        Respond to Review
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

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
        </div>
    );
};

export default VendorReviews;
