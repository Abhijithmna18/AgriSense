import React, { useState, useEffect } from 'react';
import { BarChart2, PieChart, TrendingUp, Activity } from 'lucide-react';
import feedbackService from '../../services/feedbackService';

const FeedbackAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await feedbackService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Error loading stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading analytics...</div>;
    if (!stats) return <div className="text-center py-10">Unable to load analytics.</div>;

    const { total, byCategory, averageRating } = stats;

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Feedback</p>
                        <h3 className="text-2xl font-bold dark:text-white">{total}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Average Rating</p>
                        <h3 className="text-2xl font-bold dark:text-white">{averageRating.toFixed(1)} / 5</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <PieChart size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Categories</p>
                        <h3 className="text-2xl font-bold dark:text-white">{byCategory ? byCategory.length : 0}</h3>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Feedback by Category</h3>
                <div className="space-y-4">
                    {byCategory && byCategory.map((cat, index) => (
                        <div key={index}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat._id}</span>
                                <span className="text-sm text-gray-500">{cat.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${(cat.count / total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeedbackAnalytics;
