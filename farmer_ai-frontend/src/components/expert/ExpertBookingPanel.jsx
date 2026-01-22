import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle, CreditCard, ChevronRight, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/authApi';

const ExpertBookingPanel = ({ onBookingComplete }) => {
    const [step, setStep] = useState(1); // 1: Select Expert, 2: Select Slot, 3: Confirm
    const [experts, setExperts] = useState([]);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchExperts();
    }, []);

    const fetchExperts = async () => {
        try {
            const res = await api.get('/api/consultations/experts');
            setExperts(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load experts");
        }
    };

    // Helper to generate next 7 days
    const getNext7Days = () => {
        const dates = [];
        for (let i = 1; i <= 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates;
    };

    const handleConfirmBooking = async () => {
        setLoading(true);
        try {
            await api.post('/api/consultations', {
                expertId: selectedExpert.id,
                date: selectedDate,
                timeSlot: selectedSlot
            });
            toast.success("Consultation booked successfully!");
            onBookingComplete();
        } catch (error) {
            toast.error("Booking failed");
        } finally {
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                        <User size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-stone-800">Select an Expert</h3>
                        <p className="text-stone-500 text-xs">Verified specialists for your crop needs.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experts.map(expert => (
                        <div
                            key={expert.id}
                            onClick={() => { setSelectedExpert(expert); setStep(2); }}
                            className="border border-stone-200 rounded-xl p-4 hover:border-orange-500 cursor-pointer transition-all hover:shadow-md group flex items-start gap-4"
                        >
                            <img src={expert.image} alt={expert.name} className="w-12 h-12 rounded-full object-cover border border-stone-100 group-hover:scale-105 transition-transform" />
                            <div>
                                <h4 className="font-bold text-stone-800 group-hover:text-orange-700 transition-colors">{expert.name}</h4>
                                <p className="text-xs text-stone-500 mb-1">{expert.specialization}</p>
                                <span className="inline-block bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-xs font-semibold">
                                    ₹{expert.price}/30min
                                </span>
                            </div>
                            <ChevronRight className="ml-auto text-stone-300 group-hover:text-orange-500" size={20} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-8">
                <div className="flex items-center mb-6">
                    <button onClick={() => setStep(1)} className="text-stone-400 hover:text-stone-600 mr-2">
                        ←
                    </button>
                    <div>
                        <h3 className="text-lg font-bold text-stone-800">Schedule Session</h3>
                        <p className="text-stone-500 text-xs">With {selectedExpert.name}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Select Date</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {getNext7Days().map(date => (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedDate === date
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                                        : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300'
                                    }`}
                            >
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedDate && (
                    <div className="mb-8">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Select Time</label>
                        <div className="grid grid-cols-3 gap-2">
                            {selectedExpert.availableSlots.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-2 px-3 rounded-lg border text-sm transition-all ${selectedSlot === slot
                                            ? 'bg-orange-100 text-orange-800 border-orange-500 font-bold'
                                            : 'bg-white text-stone-600 border-stone-200 hover:border-orange-300'
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    disabled={!selectedDate || !selectedSlot}
                    onClick={() => setStep(3)}
                    className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                >
                    Continue
                </button>
            </div>
        );
    }

    if (step === 3) {
        return (
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                        <CheckCircle size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-stone-800">Confirm Booking</h3>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-500">Expert</span>
                        <span className="font-semibold text-stone-800">{selectedExpert.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-500">Date & Time</span>
                        <span className="font-semibold text-stone-800">{selectedDate} @ {selectedSlot}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-stone-500">Duration</span>
                        <span className="font-semibold text-stone-800">30 Minutes</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-stone-100">
                        <span className="font-bold text-stone-800">Total Price</span>
                        <span className="font-bold text-stone-800">₹{selectedExpert.price}</span>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 mb-6">
                    <Video className="text-blue-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-blue-800 leading-relaxed">
                        A secure video meeting link will be generated automatically and shared via dashboard and email upon confirmation.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50">
                        Back
                    </button>
                    <button
                        onClick={handleConfirmBooking}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CreditCard size={18} /> Confirm & Pay
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }
};

export default ExpertBookingPanel;
