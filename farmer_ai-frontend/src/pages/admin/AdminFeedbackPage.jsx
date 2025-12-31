import React, { useState, useEffect } from 'react';
import feedbackService from '../../services/feedbackService';
import {
    MessageSquare, RefreshCw, Search, Filter,
    CheckCircle, XCircle, Clock, AlertTriangle, Send
} from 'lucide-react';

const AdminFeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        setLoading(true);
        try {
            const data = await feedbackService.getAllFeedback();
            setFeedbacks(data);
        } catch (error) {
            console.error("Error loading feedback", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const updated = await feedbackService.updateStatus(id, status);
            setFeedbacks(props => props.map(f => f._id === id ? updated : f));
            if (selectedFeedback && selectedFeedback._id === id) {
                setSelectedFeedback(updated);
            }
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedFeedback) return;

        try {
            const updated = await feedbackService.replyToFeedback(selectedFeedback._id, replyText);
            setFeedbacks(props => props.map(f => f._id === selectedFeedback._id ? updated : f));
            setSelectedFeedback(updated);
            setReplyText('');
        } catch (error) {
            console.error("Error replying", error);
        }
    };

    const filteredFeedback = feedbacks.filter(item => {
        const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
        const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.user && item.user.name && item.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const getPriorityColor = (p) => {
        if (p === 'High') return 'text-red-600 bg-red-50 border-red-200';
        if (p === 'Medium') return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <MessageSquare className="text-blue-500" />
                        Feedback Manager
                    </h1>
                    <p className="text-gray-500 text-sm">Review/Respond to user feedback</p>
                </div>
                <button onClick={loadFeedback} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <RefreshCw size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search feedback..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                    {['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* List View */}
                <div className="w-1/3 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : (
                        filteredFeedback.map(item => (
                            <div
                                key={item._id}
                                onClick={() => setSelectedFeedback(item)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedFeedback?._id === item._id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                                        {item.priority}
                                    </span>
                                    <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-white truncate">{item.category}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{item.description}</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                            item.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {item.status}
                                    </span>
                                    {item.aiAnalysis && item.aiAnalysis.sentiment === 'Negative' && (
                                        <AlertTriangle size={14} className="text-red-500" title="Negative Sentiment" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Detail View */}
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                    {selectedFeedback ? (
                        <>
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 overflow-y-auto flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedFeedback.category}</h2>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>Submitted by {selectedFeedback.user ? selectedFeedback.user.name : 'Unknown'}</span>
                                            <span>•</span>
                                            <span>{new Date(selectedFeedback.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {['Under Review', 'In Progress', 'Resolved', 'Rejected'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(selectedFeedback._id, status)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${selectedFeedback.status === status
                                                        ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900'
                                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <label className="text-xs text-gray-500 uppercase font-bold">Priority</label>
                                        <div className={`mt-1 font-medium ${selectedFeedback.priority === 'High' ? 'text-red-600' : 'text-gray-800'}`}>
                                            {selectedFeedback.priority}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <label className="text-xs text-gray-500 uppercase font-bold">AI Sentiment</label>
                                        <div className="mt-1 font-medium text-gray-800 dark:text-white">
                                            {selectedFeedback.aiAnalysis ? selectedFeedback.aiAnalysis.sentiment : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <label className="text-xs text-gray-500 uppercase font-bold">Rating</label>
                                        <div className="mt-1 font-medium text-yellow-500 flex items-center gap-1">
                                            {selectedFeedback.rating} / 5
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                                    <p className="text-gray-700 dark:text-gray-300 custom-prose whitespace-pre-wrap">
                                        {selectedFeedback.description}
                                    </p>
                                </div>

                                {/* Thread */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white border-b pb-2">Discussion Thread</h3>
                                    {selectedFeedback.adminReplies && selectedFeedback.adminReplies.map((reply, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                                                AD
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg rounded-tl-none">
                                                <div className="flex justify-between items-center mb-1 gap-4">
                                                    <span className="font-bold text-sm text-blue-900 dark:text-blue-300">{reply.adminName || 'Admin'}</span>
                                                    <span className="text-xs text-blue-400">{new Date(reply.date).toLocaleString()}</span>
                                                </div>
                                                <p className="text-blue-800 dark:text-blue-200 text-sm">{reply.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reply Box */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleReply} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!replyText.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare size={64} className="mb-4 opacity-20" />
                            <p>Select a feedback item to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminFeedbackPage;
