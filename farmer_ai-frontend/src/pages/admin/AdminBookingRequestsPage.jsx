import React, { useEffect, useState } from 'react';
import { getAllBookings, approveBooking, finalizeBooking } from '../../services/bookingApi';
import { CheckCircle, XCircle, DollarSign, Archive } from 'lucide-react';

const AdminBookingRequestsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pricingModal, setPricingModal] = useState(null); // Booking ID to approve
    const [pricingData, setPricingData] = useState({ pricePerTonPerDay: '', notes: '' });

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await getAllBookings();
            setBookings(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            await approveBooking(pricingModal._id, pricingData);
            setPricingModal(null);
            loadBookings();
        } catch (error) {
            alert('Error approving path: ' + error.message);
        }
    };

    const handleFinalize = async (id) => {
        if (!window.confirm('Are you sure you want to finalize this booking and deduct capacity?')) return;
        try {
            await finalizeBooking(id);
            loadBookings();
        } catch (error) {
            alert('Error finalizing: ' + error.message);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Booking Requests Management</h1>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Farmer</th>
                            <th className="p-4 font-semibold text-gray-600">Warehouse</th>
                            <th className="p-4 font-semibold text-gray-600">Details</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {bookings.map(booking => (
                            <tr key={booking._id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{booking.farmerId?.name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">{booking.farmerId?.email}</div>
                                </td>
                                <td className="p-4 text-gray-800">{booking.warehouseId?.name}</td>
                                <td className="p-4 text-sm">
                                    <div><span className="font-semibold">Crop:</span> {booking.cropName}</div>
                                    <div><span className="font-semibold">Qty:</span> {booking.quantity}t</div>
                                    <div><span className="font-semibold">Days:</span> {booking.duration}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                        ${booking.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-800' :
                                            booking.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' :
                                                booking.status === 'AWAITING_CONFIRMATION' ? 'bg-orange-100 text-orange-800' :
                                                    booking.status === 'STORED' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                        {booking.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {booking.status === 'REQUESTED' && (
                                        <button
                                            onClick={() => setPricingModal(booking)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                                        >
                                            <DollarSign className="w-3 h-3" /> Set Price
                                        </button>
                                    )}
                                    {booking.status === 'AWAITING_CONFIRMATION' && (
                                        <button
                                            onClick={() => handleFinalize(booking._id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                                        >
                                            <Archive className="w-3 h-3" /> Finalize
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pricing Modal */}
            {pricingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Approve & Quote</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Price per Ton/Day (₹)</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    type="number"
                                    value={pricingData.pricePerTonPerDay}
                                    onChange={e => setPricingData({ ...pricingData, pricePerTonPerDay: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Notes</label>
                                <textarea
                                    className="w-full p-2 border rounded h-20"
                                    value={pricingData.notes}
                                    onChange={e => setPricingData({ ...pricingData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setPricingModal(null)} className="flex-1 py-2 bg-gray-200 rounded">Cancel</button>
                                <button onClick={handleApprove} className="flex-1 py-2 bg-blue-600 text-white rounded">Send Quote</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookingRequestsPage;
