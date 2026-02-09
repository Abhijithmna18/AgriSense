import React, { useState } from 'react';
import { Star, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/authApi';

const ReviewForm = ({ orderId, productId, onReviewSubmitted, onCancel }) => {
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [productQuality, setProductQuality] = useState(5);
    const [deliveryExperience, setDeliveryExperience] = useState(5);
    const [sellerCommunication, setSellerCommunication] = useState(5);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !comment.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        if (comment.length < 10) {
            toast.error('Review must be at least 10 characters');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/api/reviews', {
                orderId,
                productId,
                rating,
                title,
                comment,
                productQuality,
                deliveryExperience,
                sellerCommunication
            });

            toast.success('Review submitted successfully!');
            onReviewSubmitted(data.review);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to submit review';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const StarRating = ({ value, onChange, label }) => (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            size={24}
                            className={star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Share Your Experience</h3>
                <p className="text-sm text-gray-500 mt-1">Help other buyers make informed decisions</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Overall Rating */}
                <StarRating
                    value={rating}
                    onChange={setRating}
                    label="Overall Rating"
                />

                {/* Detailed Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StarRating
                        value={productQuality}
                        onChange={setProductQuality}
                        label="Product Quality"
                    />
                    <StarRating
                        value={deliveryExperience}
                        onChange={setDeliveryExperience}
                        label="Delivery Experience"
                    />
                    <StarRating
                        value={sellerCommunication}
                        onChange={setSellerCommunication}
                        label="Seller Communication"
                    />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Review Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Summarize your experience in a few words"
                        maxLength={100}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                    />
                    <p className="text-xs text-gray-500">{title.length}/100</p>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Your Review</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share details about the product quality, delivery, and seller service..."
                        maxLength={1000}
                        rows={5}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        required
                    />
                    <p className="text-xs text-gray-500">{comment.length}/1000</p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                        Your review helps other farmers make better purchasing decisions. Please be honest and constructive.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Submitting...' : (
                            <>
                                <Send size={18} />
                                Submit Review
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
