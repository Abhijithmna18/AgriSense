import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Reply, User } from 'lucide-react';
import api from '../../services/authApi';

const VendorReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/marketplace/vendor/reviews');
            setReviews(data.data || []);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyText.trim()) return;
        try {
            await api.post(`/api/marketplace/reviews/${reviewId}/reply`, { text: replyText });
            fetchReviews(); // Refresh to show reply
            setReplyingTo(null);
            setReplyText('');
        } catch (error) {
            console.error('Failed to reply', error);
            alert('Failed to post reply');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
                    <p className="text-gray-500">See what customers are saying about your products</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                        <p className="text-gray-500">Reviews from verified purchasers will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {reviews.map(review => (
                            <div key={review._id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                                            {review.reviewer?.firstName?.[0] || 'U'}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900">
                                                    {review.product?.productRef?.name || 'Product'}
                                                </h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <span className="font-medium text-gray-700">
                                                        {review.reviewer?.firstName} {review.reviewer?.lastName}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg text-yellow-700 font-bold text-sm">
                                                <Star className="fill-current" size={14} />
                                                {review.rating}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            "{review.comment}"
                                        </p>

                                        {/* Vendor Reply Display */}
                                        {review.vendorReply ? (
                                            <div className="ml-4 mt-3 pl-4 border-l-2 border-green-200">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                                        Your Reply
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(review.vendorReply.repliedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm">{review.vendorReply.text}</p>
                                            </div>
                                        ) : (
                                            /* Reply Input */
                                            <div className="pt-2">
                                                {replyingTo === review._id ? (
                                                    <div className="space-y-3 animate-fade-in">
                                                        <textarea
                                                            value={replyText}
                                                            onChange={e => setReplyText(e.target.value)}
                                                            placeholder="Write a professional reply..."
                                                            className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                                            rows={3}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleReplySubmit(review._id)}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                                                            >
                                                                Post Reply
                                                            </button>
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setReplyingTo(review._id); setReplyText(''); }}
                                                        className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700"
                                                    >
                                                        <Reply size={16} />
                                                        Reply to customer
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorReviews;
