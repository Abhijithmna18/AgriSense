import React, { useEffect, useState } from 'react';
import feedbackService from '../../services/feedbackService';
import { Clock, CheckCircle, AlertCircle, XCircle, MessageSquare } from 'lucide-react';

const MyFeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        try {
            const data = await feedbackService.getMyFeedback();
            setFeedbacks(data);
        } catch (error) {
            console.error("Failed to load feedback", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Submitted': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'Under Review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
            'In Progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            'Resolved': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
        };
        const icons = {
            'Submitted': Clock,
            'Under Review': Clock, // Or eye
            'In Progress': Clock,
            'Resolved': CheckCircle,
            'Rejected': XCircle
        };

        const Icon = icons[status] || Clock;

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${styles[status] || styles['Submitted']}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    if (loading) return <div className="text-center py-8 text-gray-500">Loading your feedback...</div>;

    if (feedbacks.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <MessageSquare className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No feedback yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Your suggestions and reports will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {feedbacks.map((item) => (
                <div key={item._id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{item.category}</h3>
                                {getStatusBadge(item.status)}
                            </div>
                            <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${item.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-200' :
                            item.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                'bg-green-50 text-green-600 border border-green-200'
                            }`}>
                            {item.priority}
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{item.description}</p>

                    {/* Admin Replies */}
                    {item.adminReplies && item.adminReplies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900 space-y-3">
                            {item.adminReplies.map((reply, idx) => (
                                <div key={idx} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-r-lg rounded-bl-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">{reply.adminName || 'Admin'}</span>
                                        <span className="text-[10px] text-indigo-500">{new Date(reply.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-indigo-900 dark:text-indigo-200">{reply.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MyFeedbackList;
