import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/authApi';
import { Users, Activity, MessageSquare, Calendar, Trash2, Pin, Plus, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CommunityAdmin = () => {
    const { user, activeRole, loading: authLoading } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState('analytics'); // analytics, moderation, events

    // Data State
    const [analytics, setAnalytics] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Event Form State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', capacity: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Wait until auth is loaded, then check if user is admin
        if (authLoading) return;

        const isAdmin = activeRole === 'admin' || (user?.role === 'admin') || (user?.roles && user.roles.includes('admin'));

        if (isAdmin) {
            fetchAllData();
        } else {
            setLoading(false); // Stop loading if unauthorized so error shows
        }
    }, [activeRole, user, authLoading]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [analyticsRes, forumRes, eventsRes] = await Promise.all([
                api.get('/api/admin/analytics'),
                api.get('/api/forum'),
                api.get('/api/events')
            ]);
            setAnalytics(analyticsRes.data.data);
            setQuestions(forumRes.data.data);
            setEvents(eventsRes.data.data);
        } catch (error) {
            console.error('Admin Fetch Error', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePinQuestion = async (id) => {
        try {
            await api.put(`/api/admin/forum/${id}/pin`);
            fetchAllData();
        } catch (error) {
            console.error('Pin Error', error);
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm("Are you sure you want to delete this discussion?")) return;
        try {
            await api.delete(`/api/admin/forum/${id}`);
            fetchAllData();
        } catch (error) {
            console.error('Delete Error', error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/api/admin/events', newEvent);
            setIsEventModalOpen(false);
            setNewEvent({ title: '', description: '', date: '', location: '', capacity: '' });
            fetchAllData();
        } catch (error) {
            console.error('Event Creation Error', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateEventStatus = async (id, status) => {
        try {
            await api.put(`/api/admin/events/${id}/status`, { status });
            fetchAllData();
        } catch (error) {
            console.error('Status Update Error', error);
        }
    };

    if (authLoading || loading) {
        return <div className="p-12 text-center animate-pulse text-gray-400">Loading admin data...</div>;
    }

    const isAdmin = activeRole === 'admin' || (user?.role === 'admin') || (user?.roles && user.roles.includes('admin'));
    if (!isAdmin) {
        return <div className="p-8 text-center text-red-600 font-bold">Unauthorized Access</div>;
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Community Management</h1>
                <p className="text-gray-500 text-sm font-medium">Moderate forums, analyze engagement, and manage official events.</p>
            </div>

            {/* Admin Tabs */}
            <div className="flex border-b border-gray-200 mb-6 font-medium">
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-6 py-3 border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Overview & Analytics
                </button>
                <button
                    onClick={() => setActiveTab('moderation')}
                    className={`px-6 py-3 border-b-2 transition-colors ${activeTab === 'moderation' ? 'border-amber-500 text-amber-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Forum Moderation
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`px-6 py-3 border-b-2 transition-colors ${activeTab === 'events' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Event Manager
                </button>
            </div>

            {/* TAB: Analytics */}
            {activeTab === 'analytics' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total Q&As</p>
                                <h3 className="text-2xl font-black text-gray-900">{analytics.totalQuestions}</h3>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Given Answers</p>
                                <h3 className="text-2xl font-black text-gray-900">{analytics.totalAnswers}</h3>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total Thread Views</p>
                                <h3 className="text-2xl font-black text-gray-900">{analytics.totalViews}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Discussions by Category</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
                                <div key={category} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center border border-gray-100">
                                    <span className="font-medium text-gray-700">{category}</span>
                                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-xs">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: Moderation */}
            {activeTab === 'moderation' && (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Forum Posts</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Author</th>
                                    <th className="px-6 py-3">Title Snippet</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {questions.map(q => (
                                    <tr key={q._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            {q.isPinned ? <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded">Pinned</span> : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{q.author?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{q.title}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{q.category}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handlePinQuestion(q._id)}
                                                className={`p-1.5 rounded-lg border transition-colors ${q.isPinned ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-gray-400 border-gray-200 hover:text-gray-700 hover:bg-gray-50'}`}
                                                title={q.isPinned ? "Unpin" : "Pin to top"}
                                            >
                                                <Pin size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuestion(q._id)}
                                                className="p-1.5 rounded-lg bg-white border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                title="Delete Post"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB: Events */}
            {activeTab === 'events' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setIsEventModalOpen(true)}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition flex items-center gap-2"
                        >
                            <Plus size={16} /> Create Event
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <div key={event._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-gray-900">{event.title}</h3>
                                    <select
                                        value={event.status}
                                        onChange={(e) => handleUpdateEventStatus(event._id, e.target.value)}
                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-gray-50 border-gray-200 ${event.status === 'Upcoming' ? 'text-blue-600' : event.status === 'Ongoing' ? 'text-amber-600' : 'text-gray-500'}`}
                                    >
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <p className="text-gray-500 text-xs mb-4 line-clamp-2">{event.description}</p>

                                <div className="space-y-1 mb-4 text-xs font-medium text-gray-600">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Date:</span>
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Location:</span>
                                        <span className="max-w-[120px] truncate" title={event.location}>{event.location}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Capacity:</span>
                                        <span>{event.registeredUsers?.length} / {event.capacity}</span>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-1.5"
                                        style={{ width: `${Math.min(100, ((event.registeredUsers?.length || 0) / event.capacity) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50 text-emerald-900 text-lg font-bold">
                            Create Community Event
                            <button onClick={() => setIsEventModalOpen(false)} className="text-emerald-700 hover:text-emerald-900 p-1">✕</button>
                        </div>
                        <div className="p-6">
                            <form id="event-form" onSubmit={handleCreateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Title</label>
                                    <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 text-sm" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Description</label>
                                    <textarea required rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 text-sm" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Date & Time</label>
                                        <input required type="datetime-local" className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 text-sm" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Max Capacity</label>
                                        <input required type="number" min="1" className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 text-sm" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Location / Meeting Link</label>
                                    <input required type="text" placeholder="Zoom link or physical address" className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-emerald-500 text-sm" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} />
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 font-bold text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                            <button type="submit" form="event-form" disabled={submitting} className="px-5 py-2 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                                {submitting ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityAdmin;
