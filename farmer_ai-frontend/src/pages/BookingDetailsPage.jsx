import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, MapPin, Truck, CheckCircle, Clock,
    AlertTriangle, FileText, Download, ArrowLeft, CreditCard
} from 'lucide-react';
import axios from 'axios';

// Configure base URL similar to bookingApi.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const BookingDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                // Fetch user's bookings and find the specific one
                // Future optimization: Create a specific GET /api/bookings/:id endpoint
                const myRes = await axios.get(`${API_URL}/bookings/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const found = myRes.data.data.find(b => b._id === id || b.bookingId === id);
                if (found) {
                    setBooking(found);
                } else {
                    setError('Booking not found access denied.');
                }
            } catch (err) {
                setError('Failed to load booking details.');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    if (loading) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div></div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!booking) return null;

    const timeline = [
        { status: 'REQUESTED', label: 'Request Sent', date: booking.requestedAt, icon: FileText },
        { status: 'APPROVED_WAITING_PAYMENT', label: 'Approved', date: booking.approvedAt, icon: CheckCircle },
        { status: 'AWAITING_PAYMENT', label: 'Transport Added', date: booking.transportDetails?.vehicleNumber ? Date.now() : null, icon: Truck }, // Approximate
        { status: 'AWAITING_CONFIRMATION', label: 'Payment Sent', date: booking.payment?.paidAt, icon: CreditCard },
        { status: 'CONFIRMED', label: 'Confirmed', date: booking.confirmedAt, icon: CheckCircle },
        { status: 'STORED', label: 'Stored', date: null, icon: MapPin },
    ];

    const currentStepIndex = timeline.findIndex(t => t.status === booking.status);
    // Approximate progress if status matches or is past
    const isPast = (status) => {
        const order = ['REQUESTED', 'APPROVED_WAITING_PAYMENT', 'AWAITING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED', 'STORED', 'COMPLETED'];
        return order.indexOf(status) <= order.indexOf(booking.status);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <button onClick={() => navigate('/my-bookings')} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900 transition-colors">
                <ArrowLeft size={20} /> Back to My Bookings
            </button>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Booking #{booking.bookingId}</h1>
                                <p className="text-gray-500 flex items-center gap-2 mt-1">
                                    <MapPin size={16} /> {booking.warehouseId?.name}, {booking.warehouseId?.location?.city}
                                </p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-700 border border-green-200`}>
                                {booking.status.replace(/_/g, ' ')}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Crop</span>
                                <span className="font-semibold text-gray-900">{booking.cropName}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Quantity</span>
                                <span className="font-semibold text-gray-900">{booking.quantity} Tons</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Duration</span>
                                <span className="font-semibold text-gray-900">{booking.duration} Days</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Start Date</span>
                                <span className="font-semibold text-gray-900">{new Date(booking.startDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <h3 className="font-bold text-lg mb-6">Tracking Status</h3>
                        <div className="relative">
                            {/* Line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                            <div className="space-y-8">
                                {timeline.map((step, idx) => {
                                    const active = isPast(step.status);
                                    return (
                                        <div key={idx} className="relative flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 transition-colors ${active ? 'bg-green-600 text-white border-green-100' : 'bg-gray-100 text-gray-400 border-white'}`}>
                                                <step.icon size={20} />
                                            </div>
                                            <div className={`flex-1 ${active ? 'opacity-100' : 'opacity-40'}`}>
                                                <h4 className="font-semibold">{step.label}</h4>
                                                {active && step.date && <p className="text-xs text-gray-500">{new Date(step.date).toLocaleDateString()}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    {/* Pricing */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <h3 className="font-bold text-lg mb-4">Payment Summary</h3>
                        {booking.pricing?.totalPrice ? (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Rate (per ton/day)</span>
                                    <span>₹{booking.pricing.pricePerTonPerDay}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Duration</span>
                                    <span>{booking.duration} days</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold text-lg text-green-700">
                                    <span>Total</span>
                                    <span>₹{booking.pricing.totalPrice}</span>
                                </div>

                                {booking.status === 'CONFIRMED' || booking.payment?.status === 'COMPLETED' ? (
                                    <a
                                        href={`${BASE_URL}/${booking.payment?.invoicePath || `uploads/invoices/Invoice-${booking.bookingId}.pdf`}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full mt-4 py-2 border-2 border-green-600 text-green-600 rounded-xl font-semibold hover:bg-green-50 flex items-center justify-center gap-2"
                                    >
                                        <Download size={18} /> Download Invoice
                                    </a>
                                ) : null}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg">
                                Pending Quote from Admin
                            </div>
                        )}
                    </motion.div>

                    {/* Transport */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <h3 className="font-bold text-lg mb-4">Transport Details</h3>
                        {booking.transportDetails?.vehicleNumber ? (
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs">Driver Name</span>
                                    <span className="font-medium">{booking.transportDetails.driverName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Vehicle Number</span>
                                    <span className="font-medium">{booking.transportDetails.vehicleNumber}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Contact</span>
                                    <span className="font-medium">{booking.transportDetails.driverContact}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Expected Arrival</span>
                                    <span className="font-medium">{new Date(booking.transportDetails.expectedArrival).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg">
                                <Truck className="mx-auto mb-2 opacity-30" />
                                No transport details added yet.
                            </div>
                        )}
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default BookingDetailsPage;
