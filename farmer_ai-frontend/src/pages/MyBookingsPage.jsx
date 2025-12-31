import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, addTransportDetails, createPaymentOrder, verifyPayment } from '../services/bookingApi';
import { Clock, CheckCircle, AlertTriangle, Truck, FileText, CreditCard } from 'lucide-react';

const MyBookingsPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null); // For Confirm Modal
    const [transportDetails, setTransportDetails] = useState({
        type: 'SELF',
        driverName: '',
        vehicleNumber: '',
        driverContact: '',
        expectedArrival: ''
    });

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await getMyBookings();
            setBookings(data.data);
        } catch (error) {
            console.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleConfirm = async () => {
        if (!transportDetails.driverName || !transportDetails.vehicleNumber || !transportDetails.driverContact || !transportDetails.expectedArrival) {
            alert('Please fill in all transport details before paying.');
            return;
        }

        const res = await loadRazorpay();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            return;
        }

        try {
            // 1. Add Transport Details First
            // Note: In strict workflow, this sets status to AWAITING_PAYMENT
            // If the user already added transport, we might skip this, but safer to update/add.
            // But if current status is APPROVED_WAITING_PAYMENT, transport is allowed.
            await addTransportDetails(selectedBooking._id, transportDetails);

            // 2. Create Order (Pass new duration if changed)
            const order = await createPaymentOrder(selectedBooking._id, selectedBooking.tempDuration);

            // 3. Razorpay Options
            const options = {
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                name: "FarmerAI Storage",
                description: `Storage for ${selectedBooking.cropName}`,
                order_id: order.orderId,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        await verifyPayment(selectedBooking._id, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        alert('Payment Successful! Booking is now awaiting Administrative Confirmation.');
                        setSelectedBooking(null);
                        loadBookings();
                    } catch (err) {
                        alert('Payment verification failed: ' + err.message);
                    }
                },
                prefill: {
                    name: "Farmer",
                    contact: transportDetails.driverContact
                },
                theme: {
                    color: "#16a34a"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            alert('Process failed: ' + error.message);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED_WAITING_PAYMENT': return 'bg-blue-100 text-blue-800';
            case 'AWAITING_PAYMENT': return 'bg-indigo-100 text-indigo-800';
            case 'AWAITING_CONFIRMATION': return 'bg-orange-100 text-orange-800';
            case 'CONFIRMED': return 'bg-purple-100 text-purple-800';
            case 'STORED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h1>

            {loading ? <div>Loading...</div> : (
                <div className="space-y-4">
                    {bookings.length === 0 && <div className="text-gray-500">No bookings yet.</div>}
                    {bookings.map(booking => (
                        <div key={booking._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg">{booking.warehouseId?.name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                                        {booking.status.replace(/_/g, ' ')}
                                    </span>
                                    {booking.payment?.status === 'COMPLETED' && (
                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] border border-green-200 rounded">Paid</span>
                                    )}
                                </div>
                                <div className="text-gray-600 grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                    <span>Crop: {booking.cropName}</span>
                                    <span>Qty: {booking.quantity} tons</span>
                                    <span>Duration: {booking.duration} days</span>
                                    <span>Start: {new Date(booking.startDate).toLocaleDateString()}</span>
                                </div>

                                {booking.pricing?.pricePerTonPerDay && (
                                    <div className="mt-3 bg-gray-50 p-2 rounded text-sm">
                                        <div className="font-semibold text-gray-700">Quote Received:</div>
                                        <div>Rate: ₹{booking.pricing.pricePerTonPerDay}/ton/day</div>
                                        <div className="font-bold text-green-600">Total: ₹{booking.pricing.totalPrice}</div>
                                        {booking.pricing.adminNotes && <div className="text-xs italic text-gray-500 mt-1">Note: {booking.pricing.adminNotes}</div>}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={() => navigate(`/booking/${booking._id}`)}
                                    className="text-sm text-green-600 font-medium hover:underline flex items-center gap-1"
                                >
                                    View Full Details <FileText size={14} />
                                </button>

                                <div className="flex items-center gap-2">
                                    {(booking.status === 'APPROVED_WAITING_PAYMENT' || booking.status === 'AWAITING_PAYMENT') && (
                                        <button
                                            onClick={() => setSelectedBooking(booking)}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                                        >
                                            <CreditCard className="w-4 h-4" /> Pay & Confirm
                                        </button>
                                    )}
                                    {booking.status === 'AWAITING_CONFIRMATION' && (
                                        <div className="text-orange-600 flex items-center gap-2">
                                            <Clock className="w-5 h-5" /> Processing
                                        </div>
                                    )}
                                    {booking.status === 'CONFIRMED' && (
                                        <div className="text-purple-600 flex items-center gap-2">
                                            <Truck className="w-5 h-5" /> Waiting Arrival
                                        </div>
                                    )}
                                    {booking.status === 'STORED' && (
                                        <div className="text-green-600 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" /> Active
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Complete Booking</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Details for: <span className="font-semibold">{selectedBooking.warehouseId?.name}</span>
                        </p>

                        {/* Dynamic Pricing Calculation */}
                        <div className="mb-4 space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Duration (Days)</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                    value={selectedBooking.tempDuration || selectedBooking.duration}
                                    onChange={(e) => {
                                        const newDuration = parseInt(e.target.value) || 0;
                                        setSelectedBooking({
                                            ...selectedBooking,
                                            tempDuration: newDuration
                                        });
                                    }}
                                />
                            </div>

                            <div className={`p-3 rounded border ${(selectedBooking.pricing?.pricePerTonPerDay * selectedBooking.quantity * (selectedBooking.tempDuration || selectedBooking.duration)) > 50000
                                ? 'bg-red-50 border-red-200'
                                : 'bg-green-50 border-green-100'
                                }`}>
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                                    <span>Rate: ₹{selectedBooking.pricing?.pricePerTonPerDay}/ton/day</span>
                                    <span>Qty: {selectedBooking.quantity}t</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">Total Payable:</span>
                                    <span className={`text-xl font-bold ${(selectedBooking.pricing?.pricePerTonPerDay * selectedBooking.quantity * (selectedBooking.tempDuration || selectedBooking.duration)) > 50000
                                        ? 'text-red-700'
                                        : 'text-green-700'
                                        }`}>
                                        ₹{(selectedBooking.pricing?.pricePerTonPerDay * selectedBooking.quantity * (selectedBooking.tempDuration || selectedBooking.duration)).toLocaleString()}
                                    </span>
                                </div>
                                {(selectedBooking.pricing?.pricePerTonPerDay * selectedBooking.quantity * (selectedBooking.tempDuration || selectedBooking.duration)) > 50000 && (
                                    <div className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        Amount exceeds ₹50,000 limit. Please reduce duration or quantity.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Transport (Driver Name)"
                                value={transportDetails.driverName}
                                onChange={e => setTransportDetails({ ...transportDetails, driverName: e.target.value })}
                            />
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Vehicle Number"
                                value={transportDetails.vehicleNumber}
                                onChange={e => setTransportDetails({ ...transportDetails, vehicleNumber: e.target.value })}
                            />
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="Driver Contact"
                                value={transportDetails.driverContact}
                                onChange={e => setTransportDetails({ ...transportDetails, driverContact: e.target.value })}
                            />
                            <input
                                type="date"
                                className="w-full p-2 border rounded"
                                placeholder="Expected Arrival"
                                value={transportDetails.expectedArrival}
                                onChange={e => setTransportDetails({ ...transportDetails, expectedArrival: e.target.value })}
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={(selectedBooking.pricing?.pricePerTonPerDay * selectedBooking.quantity * (selectedBooking.tempDuration || selectedBooking.duration)) > 50000}
                                className={`flex-1 py-2 text-white rounded-lg flex justify-center items-center gap-2 shadow-lg ${(selectedBooking.pricing?.pricePerTonPerDay * selectedBooking.quantity * (selectedBooking.tempDuration || selectedBooking.duration)) > 50000
                                    ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                                    }`}
                            >
                                <CreditCard className="w-4 h-4" /> Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;
