import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWarehouseById } from '../services/warehouseApi';
import { MapPin, Box, Calendar, ShieldCheck, ArrowLeft, Truck } from 'lucide-react';

const WarehouseDetailsPage = () => {
    const { id } = useParams();
    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getWarehouseById(id);
                setWarehouse(data.data);
            } catch (error) {
                console.error("Error loading warehouse", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!warehouse) return <div className="p-10 text-center text-red-500">Warehouse not found</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Link to="/warehouses" className="flex items-center text-gray-500 hover:text-gray-800 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
            </Link>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Image */}
                    <div className="h-64 bg-gray-300 rounded-2xl overflow-hidden">
                        {warehouse.images && warehouse.images.length > 0 ? (
                            <img
                                src={warehouse.images[0].startsWith('http') ? warehouse.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${warehouse.images[0]}`}
                                alt={warehouse.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"
                                }}
                            />
                        ) : (
                            <img
                                src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80"
                                alt={warehouse.name}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{warehouse.name}</h1>
                                <div className="flex items-center text-gray-500 mt-1">
                                    <MapPin className="w-4 h-4 mr-1" /> {warehouse.location.address}, {warehouse.location.city}, {warehouse.location.state}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Manager Verified</div>
                                <div className="text-xs text-green-600 uppercase font-bold tracking-wide">FDA Approved</div>
                            </div>
                        </div>

                        <hr className="my-6 border-gray-100" />

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Storage Type</h3>
                                <div className="text-lg font-medium text-gray-800 flex items-center gap-2">
                                    <Box className="w-5 h-5 text-blue-600" /> {warehouse.specifications.type}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Capacity</h3>
                                <div className="text-lg font-medium text-gray-800">
                                    <span className="text-green-600 font-bold">{warehouse.capacity.available}</span>
                                    <span className="text-gray-400 text-sm ml-1">/ {warehouse.capacity.total} tons available</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-bold text-gray-800 mb-3">Supported Crops</h3>
                            <div className="flex flex-wrap gap-2">
                                {warehouse.specifications.supportedCrops.map(crop => (
                                    <span key={crop} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                        {crop}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-3">Facilities</h3>
                            <ul className="grid grid-cols-2 gap-2 text-gray-600">
                                {warehouse.specifications.facilities.map((fac, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> {fac}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Booking Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-6 border border-green-100">
                        <div className="mb-6">
                            <span className="text-gray-500 text-sm">Starts from</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-gray-900">₹{warehouse.pricing.basePricePerTon}</span>
                                <span className="text-gray-500">/ ton / day</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <Calendar className="w-4 h-4 text-green-600" />
                                <span>Min Duration: 7 days</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                <Truck className="w-4 h-4 text-green-600" />
                                <span>Transport Assistance</span>
                            </div>
                        </div>

                        <Link
                            to={`/booking/request?warehouseId=${warehouse._id}`}
                            className="w-full block text-center bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                        >
                            Request Booking
                        </Link>
                        <div className="mt-4 text-center text-xs text-gray-400">
                            No payment required to request.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDetailsPage;
