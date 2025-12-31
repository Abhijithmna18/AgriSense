import React, { useState, useEffect } from 'react';
import { TrendingUp, MessageCircle, Heart, Share2, ThumbsUp } from 'lucide-react';
import feedbackService from '../../services/feedbackService';

const CommunityTrends = () => {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrends();
    }, []);

    const loadTrends = async () => {
        try {
            const data = await feedbackService.getCommunityTrends();
            setTrends(data);
        } catch (error) {
            console.error("Error loading trends:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading community insights...</div>;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Community Pulse</h2>
                        <p className="text-blue-100">See what other farmers are discussing right now.</p>
                    </div>
                </div>
                <div className="flex gap-4 mt-6">
                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                        <span className="block text-2xl font-bold">120+</span>
                        <span className="text-xs text-blue-100">Reports Today</span>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                        <span className="block text-2xl font-bold">98%</span>
                        <span className="text-xs text-blue-100">Resolution Rate</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trends.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">
                                {item.category}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{item.mood === 'happy' ? 'Positive Experience' : 'Reported Issue'}</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Heart key={i} size={14} className={i < item.rating ? "text-red-500 fill-red-500" : "text-gray-200"} />
                                ))}
                            </div>
                            <span className="text-xs text-gray-500">({item.rating}/5)</span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium">
                                <ThumbsUp size={14} /> Helpful
                            </button>
                            <button className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium">
                                <Share2 size={14} /> Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {trends.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No community trends available yet.</p>
                </div>
            )}
        </div>
    );
};

export default CommunityTrends;
