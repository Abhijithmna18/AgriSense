import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createBookingRequest } from '../services/bookingApi';
import { getWarehouseById } from '../services/warehouseApi';
import { Calendar, Package, AlertCircle } from 'lucide-react';

const BookingRequestForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const warehouseId = searchParams.get('warehouseId');

    const [warehouse, setWarehouse] = useState(null);
    const [formData, setFormData] = useState({
        cropName: '',
        cropType: 'grain', // Default or derived
        quantity: '',
        startDate: '',
        duration: 30,
        notes: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (warehouseId) {
            getWarehouseById(warehouseId).then(data => setWarehouse(data.data));
        }
    }, [warehouseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createBookingRequest({
                warehouseId,
                ...formData,
                quantity: Number(formData.quantity),
                duration: Number(formData.duration)
            });
            navigate('/my-bookings'); // Redirect to tracking page
        } catch (err) {
            setError(err.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (!warehouse) return <div className="p-10 text-center">Loading Warehouse info...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Request Storage</h2>
                    <p className="text-gray-500">at {warehouse.name}</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Crop Name</label>
                        <select
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            value={formData.cropName}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                            required
                        >
                            <option value="">Select Crop</option>
                            {warehouse.specifications.supportedCrops.map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Tons)</label>
                            <div className="relative">
                                <Package className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="number"
                                    min="0.1"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Max: {warehouse.capacity.available} tons</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Days)</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="date"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                        <textarea
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                            placeholder="Specific storage requirements..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-green-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Send Booking Request'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Admin will review and approve within 24 hours.
                    </p>
                </form>
            </div>
        </div>
    );
};
export default BookingRequestForm;
