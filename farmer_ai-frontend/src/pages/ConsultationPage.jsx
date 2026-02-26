import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Star, Clock, Video, CheckCircle,
    XCircle, ArrowLeft, Loader2, User, BookOpen,
    ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/authApi';

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const ConsultationPage = ({ isEmbedded }) => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('experts');          // 'experts' | 'my'
    const [experts, setExperts] = useState([]);
    const [myConsultations, setMyConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);       // expert being booked
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Minimum date for booking = tomorrow
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minDateStr = minDate.toISOString().split('T')[0];

    useEffect(() => { fetchExperts(); fetchMyConsultations(); }, []);

    const fetchExperts = async () => {
        try {
            const res = await api.get('/api/advisory/experts');
            setExperts(res.data?.data || []);
        } catch { toast.error('Failed to load experts'); }
        finally { setLoading(false); }
    };

    const fetchMyConsultations = async () => {
        try {
            const res = await api.get('/api/advisory/my-consultations');
            setMyConsultations(res.data?.data || []);
        } catch { /* ignore */ }
    };

    const fetchSlots = async (expertId, date) => {
        setSlotsLoading(true);
        setSlots([]);
        setSelectedSlot('');
        try {
            const res = await api.get(`/api/advisory/slots?expertId=${expertId}&date=${date}`);
            setSlots(res.data?.slots || []);
        } catch { toast.error('Failed to load slots'); }
        finally { setSlotsLoading(false); }
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        if (booking) fetchSlots(booking.id, e.target.value);
    };

    const handleBook = async () => {
        if (!selectedSlot) return toast.error('Please select a time slot.');
        setSubmitting(true);
        try {
            await api.post('/api/advisory/book', {
                expertId: booking.id,
                scheduledAt: selectedSlot,
                notes
            });
            toast.success('Consultation booked! Check your notifications for the meeting link.');
            setBooking(null);
            setSelectedDate(''); setSlots([]); setSelectedSlot(''); setNotes('');
            fetchMyConsultations();
            setTab('my');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally { setSubmitting(false); }
    };

    const handleCancel = async (id) => {
        try {
            await api.put(`/api/advisory/${id}/cancel`);
            toast.success('Consultation cancelled.');
            fetchMyConsultations();
        } catch { toast.error('Failed to cancel consultation.'); }
    };

    const StatusBadge = ({ status }) => {
        const cfg = {
            upcoming: { color: 'blue', label: 'Upcoming' },
            completed: { color: 'green', label: 'Completed' },
            cancelled: { color: 'red', label: 'Cancelled' }
        }[status] || { color: 'gray', label: status };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-${cfg.color}-100 text-${cfg.color}-700`}>
                {cfg.label}
            </span>
        );
    };

    return (
        <div className={`p-6 md:p-8 max-w-6xl mx-auto space-y-6 ${isEmbedded ? 'pt-0' : ''}`}>

            {/* Back */}
            {!isEmbedded && (
                <button onClick={() => navigate('/farmer-dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            )}

            {/* Header */}
            {!isEmbedded && (
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BookOpen className="text-indigo-600" size={32} /> Expert Consultations
                        </h1>
                        <p className="text-gray-500 mt-1">Book a 1-on-1 session with a verified agricultural expert via video call.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Sessions from</p>
                        <p className="text-2xl font-black text-indigo-700">₹400</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                {[
                    { key: 'experts', label: 'Book Expert' },
                    { key: 'my', label: `My Sessions${myConsultations.length > 0 ? ` (${myConsultations.length})` : ''}` }
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* — Experts Tab — */}
            {tab === 'experts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {loading ? (
                        <div className="col-span-2 flex justify-center py-16">
                            <Loader2 className="animate-spin text-indigo-400" size={36} />
                        </div>
                    ) : experts.map(expert => (
                        <motion.div key={expert.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                                <img src={expert.image} alt={expert.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900 truncate">{expert.name}</h3>
                                        {!expert.available && (
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Unavailable</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-indigo-600 font-medium mt-0.5">{expert.specialization}</p>
                                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Star size={13} className="text-yellow-500 fill-yellow-500" />{expert.rating}</span>
                                        <span className="flex items-center gap-1"><User size={13} />{expert.sessions} sessions</span>
                                        <span className="font-bold text-indigo-700 ml-auto">₹{expert.fee}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setBooking(expert); setSelectedDate(''); setSlots([]); }}
                                disabled={!expert.available}
                                className={`mt-4 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all
                                    ${expert.available
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                <Calendar size={15} />
                                {expert.available ? 'Book Session' : 'Not Available'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* — My Sessions Tab — */}
            {tab === 'my' && (
                <div className="space-y-4">
                    {myConsultations.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No sessions booked yet.</p>
                            <button onClick={() => setTab('experts')} className="mt-3 text-indigo-600 font-semibold text-sm hover:underline">
                                Book your first session →
                            </button>
                        </div>
                    ) : myConsultations.map(c => (
                        <div key={c._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-5">
                            <img src={c.expert?.image || 'https://i.pravatar.cc/60'} alt={c.expert?.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-gray-900">{c.expert?.name}</h3>
                                    <StatusBadge status={c.status} />
                                </div>
                                <p className="text-sm text-indigo-600 mt-0.5">{c.expert?.specialization}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={13} />{formatDate(c.scheduledAt)}</span>
                                    <span className="flex items-center gap-1"><Clock size={13} />{formatTime(c.scheduledAt)}</span>
                                    <span className="font-semibold text-gray-700">₹{c.price}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-shrink-0">
                                {c.status === 'upcoming' && c.meetingLink && (
                                    <a href={c.meetingLink} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors">
                                        <Video size={13} /> Join Call
                                    </a>
                                )}
                                {c.status === 'upcoming' && (
                                    <button onClick={() => handleCancel(c._id)}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors">
                                        <XCircle size={13} /> Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* — Booking Modal — */}
            <AnimatePresence>
                {booking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setBooking(null)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <img src={booking.image} alt={booking.name} className="w-12 h-12 rounded-full border-2 border-indigo-100" />
                                <div>
                                    <h3 className="font-bold text-gray-900">Book: {booking.name}</h3>
                                    <p className="text-sm text-indigo-600">{booking.specialization}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select Date</label>
                                    <input type="date" min={minDateStr} value={selectedDate} onChange={handleDateChange}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                                </div>

                                {selectedDate && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select Time Slot</label>
                                        {slotsLoading ? (
                                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-400" size={20} /></div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                                                {slots.filter(s => s.available).map(slot => (
                                                    <button key={slot.datetime} onClick={() => setSelectedSlot(slot.datetime)}
                                                        className={`py-2 rounded-lg text-xs font-semibold border transition-all
                                                            ${selectedSlot === slot.datetime
                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300'}`}>
                                                        {slot.label}
                                                    </button>
                                                ))}
                                                {slots.filter(s => s.available).length === 0 && (
                                                    <p className="col-span-3 text-center text-xs text-gray-400 py-3">No available slots on this date.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (optional)</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                                        placeholder="Briefly describe your farming issue..."
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Session fee</p>
                                        <p className="text-xl font-black text-indigo-700">₹{booking.fee}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setBooking(null)}
                                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleBook} disabled={!selectedSlot || submitting}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                                ${!selectedSlot || submitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}`}>
                                            {submitting ? <Loader2 className="animate-spin" size={15} /> : <CheckCircle size={15} />}
                                            Confirm Booking
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ConsultationPage;
