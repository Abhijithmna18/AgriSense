import React, { useState } from 'react';
import { Calendar, Clock, Video, Trash2, VideoOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/authApi';

const BookingSummaryCard = ({ consultation, onRefresh }) => {
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this session?")) return;

        setCancelling(true);
        try {
            await api.delete(`/api/consultations/${consultation._id}`);
            toast.success("Session cancelled");
            onRefresh();
        } catch (error) {
            toast.error("Failed to cancel");
        } finally {
            setCancelling(false);
        }
    };

    if (!consultation || consultation.status === 'cancelled') return null;

    const isUpcoming = new Date(consultation.scheduledAt) > new Date();

    return (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${isUpcoming ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                {isUpcoming ? 'UPCOMING' : 'COMPLETED'}
            </div>

            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Video size={14} /> Scheduled Consultation
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center gap-4">
                    <img
                        src={consultation.expert.image}
                        alt={consultation.expert.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                        <h4 className="font-bold text-stone-800 text-lg leading-tight">{consultation.expert.name}</h4>
                        <p className="text-stone-500 text-sm">{consultation.expert.specialization}</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="bg-stone-50 p-3 rounded-lg">
                        <span className="block text-xs text-stone-400 mb-1 flex items-center gap-1"><Calendar size={12} /> Date</span>
                        <span className="font-semibold text-stone-800">
                            {new Date(consultation.scheduledAt).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-lg">
                        <span className="block text-xs text-stone-400 mb-1 flex items-center gap-1"><Clock size={12} /> Time</span>
                        <span className="font-semibold text-stone-800">
                            {new Date(consultation.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <a
                    href={consultation.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                    <Video size={18} /> Join Video Call
                </a>

                {isUpcoming && (
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                        title="Cancel Session"
                    >
                        {cancelling ? <span className="animate-spin">...</span> : <Trash2 size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

export default BookingSummaryCard;
