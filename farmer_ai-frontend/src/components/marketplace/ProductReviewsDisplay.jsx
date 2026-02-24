import React, { useState, useEffect } from 'react';
import { Star, X, User, Calendar } from 'lucide-react';
import api from '../../services/authApi';

const ProductReviewsDisplay = ({ productId, isOpen, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [averageRating, setAverageRating] = useState(0);

    useEffect(() => {
        if (isOpen && productId) {
            fetchReviews();
        }
    }, [isOpen, productId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/reviews/product/${productId}`);
            setReviews(data || []);

            // Calculate average
            if (data && data.length > 0) {
                const total = data.reduce((acc, curr) => acc + curr.rating, 0);
                setAverageRating((total / data.length).toFixed(1));
            } else {
                setAverageRating(0);
            }
        } catch (error) {
            console.error('Failed to fetch product reviews', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col relative animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Customer Reviews</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center text-yellow-400">
                                <Star className="fill-current" size={20} />
                                <span className="ml-1 text-lg font-bold text-gray-900">{averageRating}</span>
                            </div>
                            <span className="text-gray-500">• {reviews.length} reviews</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Reviews List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
                            Loading reviews...
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-sm">
                                                {review.buyer?.name?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {review.buyer?.name || 'Verified Buyer'}
                                                </p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded-lg">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={`${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                        {review.comment}
                                    </p>

                                    {/* Link to reply if it exists */}
                                    {review.vendorReply && (
                                        <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                                            <p className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                                <Store size={12} /> Response from Seller
                                            </p>
                                            <p className="text-xs text-gray-600 italic">
                                                "{review.vendorReply.text}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-gray-900 font-medium mb-1">No reviews yet</h3>
                            <p className="text-gray-500 text-sm">Be the first to review this product!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper for store icon (needed since I used it above)
const Store = ({ size = 16, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
        <path d="M2 7h20" />
        <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
);

export default ProductReviewsDisplay;
