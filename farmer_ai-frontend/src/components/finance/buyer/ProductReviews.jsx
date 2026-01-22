
import React, { useState, useEffect } from 'react';
import { Star, Send, User, MessageSquare } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/reviews` : 'http://localhost:5002/api/reviews';

const ProductReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({
        vendorName: '',
        productName: '',
        rating: 5,
        comment: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(response.data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.post(API_URL, newReview, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewReview({ vendorName: '', productName: '', rating: 5, comment: '' });
            fetchReviews();
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                        Product Reviews
                    </h2>
                    <p className="text-slate-500 text-sm mt-2 font-medium">
                        Share your feedback to help us build a trusted marketplace.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Submit Review Form - 4 Columns */}
                <div className="lg:col-span-4">
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-indigo-100/50 border border-white/50 sticky top-24">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl pointer-events-none -z-10" />

                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                                <MessageSquare size={18} />
                            </div>
                            Write a Review
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vendor</label>
                                <input
                                    type="text"
                                    required
                                    value={newReview.vendorName}
                                    onChange={e => setNewReview({ ...newReview, vendorName: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-700 shadow-sm transition-all"
                                    placeholder="e.g. Green Valley Farms"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Product</label>
                                <input
                                    type="text"
                                    required
                                    value={newReview.productName}
                                    onChange={e => setNewReview({ ...newReview, productName: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold text-slate-700 shadow-sm transition-all"
                                    placeholder="e.g. Wheat - Sharbati"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rating</label>
                                <div className="flex gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm justify-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className="group relative focus:outline-none"
                                        >
                                            <Star
                                                fill={star <= newReview.rating ? "#FBBF24" : "transparent"}
                                                className={`w-8 h-8 transition-all duration-200 ${star <= newReview.rating ? 'text-amber-400 scale-110' : 'text-slate-200 group-hover:text-amber-200'}`}
                                                strokeWidth={2}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Experience</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={newReview.comment}
                                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border-0 ring-1 ring-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium resize-none shadow-sm transition-all placeholder:text-slate-300"
                                    placeholder="Share your experience..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-300/50 hover:shadow-indigo-400/50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all flex items-center justify-center gap-2.5"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>Submit Feedback</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Reviews List - 8 Columns */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                        <div className="h-6 w-1 bg-indigo-500 rounded-full" />
                        <h3 className="text-lg font-bold text-slate-800">Recent Reviews</h3>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                <MessageSquare className="text-indigo-300" size={32} />
                            </div>
                            <h4 className="text-slate-900 font-bold mb-1">No reviews yet</h4>
                            <p className="text-slate-400 text-sm">Be the first to share your experience!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {reviews.map((review) => (
                                <div key={review._id} className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/60 border border-slate-100 transition-all duration-300 hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold border border-white shadow-inner">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{review.vendorName}</h4>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{review.productName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 shadow-sm">
                                            <Star size={14} className="text-amber-400" fill="currentColor" />
                                            <span className="text-xs font-black text-amber-600">{review.rating}.0</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute -left-2 -top-2 text-slate-200 pointer-events-none">"</div>
                                        <p className="text-slate-600 text-sm leading-relaxed pl-2 min-h-[3rem]">
                                            {review.comment}
                                        </p>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-slate-50 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Verified Buyer</span>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;
