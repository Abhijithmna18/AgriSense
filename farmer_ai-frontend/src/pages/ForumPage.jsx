import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import api from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, MessageSquare, Calendar, ChevronRight, CheckCircle, ThumbsUp, Eye, SearchX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['All', 'Crops', 'Soil', 'Irrigation', 'Machinery', 'Market', 'Weather', 'Pest Control', 'General'];

const ForumPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState('discussions'); // 'discussions' or 'events'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Data State
    const [questions, setQuestions] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // New Question Modal State
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ title: '', body: '', category: 'General', tags: '' });
    const [submitting, setSubmitting] = useState(false);

    // Fetch dependencies based on tab
    useEffect(() => {
        if (activeTab === 'discussions') {
            fetchQuestions();
        } else {
            fetchEvents();
        }
    }, [activeTab, selectedCategory]);

    // Initial data fetch and debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (activeTab === 'discussions') fetchQuestions();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = { category: selectedCategory };
            if (searchQuery) params.search = searchQuery;

            const res = await api.get('/api/forum', { params });
            setQuestions(res.data.data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/events');
            setEvents(res.data.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const tagsArray = newQuestion.tags.split(',').map(tag => tag.trim()).filter(Boolean);
            const payload = { ...newQuestion, tags: tagsArray };

            await api.post('/api/forum', payload); // Create new post
            setIsAskModalOpen(false);
            setNewQuestion({ title: '', body: '', category: 'General', tags: '' }); // Reset
            fetchQuestions(); // Refresh list
        } catch (error) {
            console.error('Failed to post question');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEventRegister = async (eventId) => {
        try {
            await api.post(`/api/events/${eventId}/register`);
            fetchEvents(); // Refresh capacity/status
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--admin-bg)] font-sans selection:bg-[var(--admin-accent)] selection:text-white">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main content with left margin to account for fixed sidebar */}
            <div className="flex-1 flex flex-col relative transition-all duration-300 w-full overflow-y-auto custom-scrollbar md:ml-64">
                <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <div className="p-6 md:p-8 max-w-7xl mx-auto w-full pt-20">

                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-[var(--admin-text-primary)] tracking-tight">Community & Events</h1>
                            <p className="text-[var(--admin-text-secondary)] mt-1.5 font-medium">Connect with experts and fellow farmers, share knowledge, and discover local meetups.</p>
                        </div>

                        <div className="flex bg-[var(--border-color)] p-1 rounded-xl w-full md:w-auto overflow-hidden border border-[var(--admin-border)] shadow-sm">
                            <button
                                onClick={() => setActiveTab('discussions')}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-medium text-sm transition-all focus:outline-none flex items-center justify-center gap-2 ${activeTab === 'discussions'
                                        ? 'bg-white text-[var(--admin-primary)] shadow-md'
                                        : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-gray-50'
                                    }`}
                            >
                                <MessageSquare size={18} />
                                Discussions
                            </button>
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-medium text-sm transition-all focus:outline-none flex items-center justify-center gap-2 ${activeTab === 'events'
                                        ? 'bg-white text-[var(--admin-primary)] shadow-md'
                                        : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-gray-50'
                                    }`}
                            >
                                <Calendar size={18} />
                                Upcoming Events
                            </button>
                        </div>
                    </div>

                    {/* Discussions View */}
                    {activeTab === 'discussions' && (
                        <div className="space-y-6">
                            {/* Toolbar (Search & Filter) */}
                            <div className="bg-white rounded-2xl border border-[var(--admin-border)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-4 flex flex-col md:flex-row gap-4 items-center">
                                <div className="relative w-full md:w-96">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search questions or keywords..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/20 focus:border-[var(--admin-primary)] transition-all"
                                    />
                                </div>
                                <div className="flex-1 overflow-x-auto hide-scrollbar flex gap-2">
                                    {CATEGORIES.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === category
                                                    ? 'bg-[var(--admin-primary)] text-white border-[var(--admin-primary)]'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setIsAskModalOpen(true)}
                                    className="w-full md:w-auto whitespace-nowrap flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-[0.98]"
                                >
                                    <MessageSquare size={18} />
                                    Ask a Question
                                </button>
                            </div>

                            {/* Questions List */}
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="text-center p-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                                    </div>
                                ) : questions.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-[var(--admin-border)] p-12 text-center shadow-sm">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                            <SearchX className="text-gray-400" size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">No discussions found</h3>
                                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">We couldn't find any questions matching your search and category filters. Why not start a new one?</p>
                                        <button
                                            onClick={() => setIsAskModalOpen(true)}
                                            className="px-6 py-2.5 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors"
                                        >
                                            Ask the first question
                                        </button>
                                    </div>
                                ) : (
                                    questions.map(q => {
                                        const hasBestAnswer = q.answers?.some(a => a.isBestAnswer);
                                        return (
                                            <div
                                                key={q._id}
                                                onClick={() => navigate(`/community/question/${q._id}`)}
                                                className="group bg-white rounded-2xl border border-[var(--admin-border)] p-5 hover:border-[var(--admin-primary)]/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer transition-all flex items-start gap-4"
                                            >
                                                {/* Stats Column */}
                                                <div className="hidden sm:flex flex-col items-center gap-2 min-w-[60px]">
                                                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${hasBestAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                                        <span className="font-bold text-lg leading-tight">{q.answers?.length || 0}</span>
                                                        <span className="text-[10px] font-medium uppercase tracking-wide">Answers</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                                        <Eye size={14} /> {q.views}
                                                    </div>
                                                </div>

                                                {/* Content Column */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {q.isPinned && (
                                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Pinned Admin</span>
                                                        )}
                                                        <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{q.category}</span>
                                                    </div>

                                                    <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-[var(--admin-primary)] transition-colors mb-2 leading-snug pr-8 line-clamp-2">
                                                        {q.title}
                                                    </h3>

                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                                        {q.body}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-gray-400">
                                                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden">
                                                                {q.author?.name ? q.author.name.substring(0, 2) : '?'}
                                                            </div>
                                                            <span className="text-gray-600">{q.author?.name || 'Unknown User'}</span>
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}</span>

                                                        {q.tags?.length > 0 && (
                                                            <>
                                                                <span>•</span>
                                                                <div className="flex gap-1.5">
                                                                    {q.tags.slice(0, 3).map(tag => (
                                                                        <span key={tag} className="text-[var(--admin-primary)]/80">#{tag}</span>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Events View */}
                    {activeTab === 'events' && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="text-center p-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                                </div>
                            ) : events.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-[var(--admin-border)] p-12 text-center shadow-sm">
                                    <Calendar className="text-gray-400 mx-auto mb-4" size={48} />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Upcoming Events</h3>
                                    <p className="text-gray-500">Check back later for new webinars, training sessions, and local meetups organized by our experts.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {events.map(event => {
                                        const eventDate = new Date(event.date);
                                        const isRegistered = event.registeredUsers?.includes(user?.id);
                                        const isFull = event.registeredUsers?.length >= event.capacity;
                                        const isPast = eventDate < new Date();

                                        return (
                                            <div key={event._id} className="bg-white rounded-2xl border border-[var(--admin-border)] overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col">
                                                {/* Date Banner */}
                                                <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-white w-12 h-12 rounded-xl border border-emerald-200 flex flex-col items-center justify-center shadow-sm text-emerald-800">
                                                            <span className="text-[10px] font-bold uppercase leading-none mb-0.5">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                                                            <span className="text-lg font-black leading-none">{eventDate.getDate()}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{event.status}</p>
                                                            <p className="text-sm font-medium text-emerald-900">{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2 pr-4">{event.title}</h3>
                                                    <p className="text-sm text-gray-500 mb-4 line-clamp-3 leading-relaxed flex-1">{event.description}</p>

                                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4 space-y-2">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500 font-medium">Location</span>
                                                            <span className="font-bold text-gray-800 text-right max-w-[150px] truncate" title={event.location}>{event.location}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500 font-medium">Host</span>
                                                            <span className="font-bold text-gray-800">{event.organizer?.name || 'Admin'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                                                        <div className="text-xs font-medium">
                                                            <span className={isFull ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
                                                                {event.registeredUsers?.length || 0}
                                                            </span>
                                                            <span className="text-gray-400"> / {event.capacity} registered</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleEventRegister(event._id)}
                                                            disabled={isPast || isRegistered || isFull}
                                                            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isPast ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                                                                    isRegistered ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-not-allowed' :
                                                                        isFull ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed' :
                                                                            'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                                                                }`}
                                                        >
                                                            {isPast ? 'Ended' : isRegistered ? 'Registered' : isFull ? 'Full' : 'Register Now'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Ask Question Modal */}
            {isAskModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                                <MessageSquare className="text-emerald-600" size={20} />
                                Start a Discussion
                            </h2>
                            <button onClick={() => setIsAskModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100">
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form id="ask-form" onSubmit={handleAskQuestion} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="E.g., What are the early signs of late blight in tomatoes?"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                                        value={newQuestion.title}
                                        onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })}
                                    />
                                    <p className="text-[11px] text-gray-500 mt-1">Be specific and imagine you're asking a question to another person.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Details</label>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="Include all the information someone would need to answer your question (symptoms, duration, crop age, recent weather, etc.)"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-y min-h-[120px]"
                                        value={newQuestion.body}
                                        onChange={e => setNewQuestion({ ...newQuestion, body: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                        <select
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                                            value={newQuestion.category}
                                            onChange={e => setNewQuestion({ ...newQuestion, category: e.target.value })}
                                        >
                                            {CATEGORIES.filter(c => c !== 'All').map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <input
                                            type="text"
                                            placeholder="tomatoes, blight, fungicide"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                                            value={newQuestion.tags}
                                            onChange={e => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                                        />
                                        <p className="text-[11px] text-gray-500 mt-1">Comma separated</p>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                            <button
                                onClick={() => setIsAskModalOpen(false)}
                                className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="ask-form"
                                disabled={submitting || !newQuestion.title || !newQuestion.body}
                                className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
                            >
                                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
                                {submitting ? 'Posting...' : 'Post Question'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ForumPage;
