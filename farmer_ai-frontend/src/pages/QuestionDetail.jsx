import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import api from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MessageSquare, ThumbsUp, CheckCircle, CornerDownRight, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const QuestionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [question, setQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newAnswer, setNewAnswer] = useState('');
    const [submittingAnswer, setSubmittingAnswer] = useState(false);

    // For Comments
    const [activeCommentBox, setActiveCommentBox] = useState(null);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const res = await api.get(`/api/forum/${id}`);
            setQuestion(res.data.data);
        } catch (error) {
            console.error('Failed to fetch question:', error);
            // Optionally redirect back or show error state
        } finally {
            setLoading(false);
        }
    };

    const handlePostAnswer = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim()) return;
        setSubmittingAnswer(true);
        try {
            await api.post(`/api/forum/${id}/answers`, { body: newAnswer });
            setNewAnswer('');
            fetchQuestion(); // Refresh whole thread
        } catch (error) {
            console.error('Failed to post answer');
        } finally {
            setSubmittingAnswer(false);
        }
    };

    const handleUpvote = async (answerId) => {
        try {
            await api.put(`/api/forum/answers/${answerId}/vote`);
            fetchQuestion(); // Refresh to get updated votes
        } catch (error) {
            console.error('Failed to upvote');
        }
    };

    const handleAcceptAnswer = async (answerId) => {
        try {
            await api.put(`/api/forum/answers/${answerId}/accept`);
            fetchQuestion();
        } catch (error) {
            console.error('Failed to accept answer');
        }
    };

    const handlePostComment = async (e, answerId) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post(`/api/forum/answers/${answerId}/comments`, { body: newComment });
            setNewComment('');
            setActiveCommentBox(null);
            fetchQuestion();
        } catch (error) {
            console.error('Failed to post comment');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[var(--admin-bg)] overflow-hidden">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col relative w-full">
                    <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex h-screen bg-[var(--admin-bg)] overflow-hidden">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col relative w-full">
                    <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                    <div className="flex-1 flex items-center justify-center flex-col">
                        <h2 className="text-xl font-bold text-gray-800">Question not found</h2>
                        <button onClick={() => navigate('/community')} className="mt-4 text-emerald-600 hover:underline">Return to Community</button>
                    </div>
                </div>
            </div>
        );
    }

    // Sort answers: Best answer first, then by upvotes
    const sortedAnswers = [...(question.answers || [])].sort((a, b) => {
        if (a.isBestAnswer) return -1;
        if (b.isBestAnswer) return 1;
        return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    });

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--admin-bg)] font-sans">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col relative transition-all duration-300 w-full overflow-y-auto custom-scrollbar md:ml-64">
                <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <div className="p-6 md:p-8 max-w-4xl mx-auto w-full pt-20">

                    <button
                        onClick={() => navigate('/community')}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors mb-6 group w-fit"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Community
                    </button>

                    {/* Original Question Post */}
                    <div className="bg-white rounded-2xl border border-[var(--admin-border)] overflow-hidden shadow-sm mb-8">
                        <div className="p-6 md:p-8 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                {question.isPinned && (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Pinned Admin</span>
                                )}
                                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{question.category}</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
                                {question.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-500 mb-6">
                                <span className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold uppercase">
                                        {question.author?.name ? question.author.name.substring(0, 2) : '?'}
                                    </div>
                                    <span className="text-gray-700">{question.author?.name || 'Unknown User'}</span>
                                    {question.author?.role === 'admin' && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Admin</span>}
                                </span>
                                <span>•</span>
                                <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                                <span>•</span>
                                <span>{question.views} views</span>
                            </div>

                            <div className="prose prose-sm max-w-none text-gray-700 leading-loose whitespace-pre-wrap">
                                {question.body}
                            </div>

                            {question.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {question.tags.map(tag => (
                                        <span key={tag} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold px-2.5 py-1 rounded-lg">#{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Answers Section */}
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-[var(--admin-text-primary)]">
                            {sortedAnswers.length} {sortedAnswers.length === 1 ? 'Answer' : 'Answers'}
                        </h3>
                    </div>

                    <div className="space-y-6 mb-12">
                        {sortedAnswers.map((answer) => {
                            const isMyQuestion = user?.id === question.author?._id;
                            const hasUpvoted = answer.upvotes?.includes(user?.id);

                            return (
                                <div key={answer._id} className={`bg-white rounded-2xl border transition-all ${answer.isBestAnswer ? 'border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20' : 'border-[var(--admin-border)] shadow-sm'}`}>
                                    {answer.isBestAnswer && (
                                        <div className="bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-2 flex items-center gap-2 border-b border-emerald-100 rounded-t-2xl">
                                            <CheckCircle size={14} className="text-emerald-600" />
                                            Marked as Best Answer by Author
                                        </div>
                                    )}

                                    <div className="p-5 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">

                                        {/* Voting Column */}
                                        <div className="flex flex-row md:flex-col items-center gap-2">
                                            <button
                                                onClick={() => handleUpvote(answer._id)}
                                                className={`p-2 rounded-xl transition-colors border ${hasUpvoted ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                                            >
                                                <ThumbsUp size={18} className={hasUpvoted ? "fill-current" : ""} />
                                            </button>
                                            <span className={`font-bold text-lg ${hasUpvoted ? 'text-emerald-700' : 'text-gray-600'}`}>
                                                {answer.upvotes?.length || 0}
                                            </span>

                                            {/* Accept Answer Button (Only question author can see this) */}
                                            {isMyQuestion && !answer.isBestAnswer && (
                                                <button
                                                    onClick={() => handleAcceptAnswer(answer._id)}
                                                    className="mt-2 text-[10px] font-bold text-gray-400 hover:text-emerald-600 transition-colors uppercase ml-4 md:ml-0"
                                                    title="Mark as Best Answer"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Answer Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                                                {answer.body}
                                            </div>

                                            <div className="flex justify-between items-center mb-6">
                                                <button
                                                    onClick={() => setActiveCommentBox(activeCommentBox === answer._id ? null : answer._id)}
                                                    className="text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1.5"
                                                >
                                                    <MessageSquare size={14} />
                                                    Reply
                                                </button>

                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                                    <span className="text-gray-400">{formatDistanceToNow(new Date(answer.createdAt))} ago</span>
                                                    <span>•</span>
                                                    <span className="text-gray-700">{answer.author?.name || 'Unknown User'}</span>
                                                    {answer.author?.role === 'admin' && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase">Admin</span>}
                                                </div>
                                            </div>

                                            {/* Comments Section */}
                                            {answer.comments?.length > 0 && (
                                                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                                                    {answer.comments.map(comment => (
                                                        <div key={comment._id} className="flex gap-2 text-sm ml-2 md:ml-4">
                                                            <div className="mt-1 text-gray-300">
                                                                <CornerDownRight size={14} />
                                                            </div>
                                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex-1">
                                                                <p className="text-gray-700 leading-relaxed mb-1">{comment.body}</p>
                                                                <div className="flex justify-between items-center text-[10px] font-medium text-gray-400">
                                                                    <span>{comment.author?.name || 'Unknown'}</span>
                                                                    <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add Comment Input */}
                                            {activeCommentBox === answer._id && (
                                                <form onSubmit={(e) => handlePostComment(e, answer._id)} className="mt-4 flex gap-2 ml-2 md:ml-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                                                        value={newComment}
                                                        onChange={e => setNewComment(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!newComment.trim()}
                                                        className="px-3 py-2 bg-gray-100 text-gray-600 font-bold text-xs rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                                    >
                                                        Post
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Submit Answer Form */}
                    <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-6 md:p-8">
                        <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
                            <Send size={18} className="text-emerald-600" />
                            Your Answer
                        </h3>
                        <form onSubmit={handlePostAnswer}>
                            <textarea
                                rows={6}
                                placeholder="Share your knowledge or experience to help solve this problem..."
                                className="w-full px-4 py-3 bg-white border border-emerald-200/60 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-y shadow-sm"
                                value={newAnswer}
                                onChange={e => setNewAnswer(e.target.value)}
                            ></textarea>
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={submittingAnswer || !newAnswer.trim()}
                                    className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {submittingAnswer ? 'Posting...' : 'Post Your Answer'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QuestionDetail;
