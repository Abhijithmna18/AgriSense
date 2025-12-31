import React, { useState, useEffect } from 'react';
import { getWarehouses } from '../services/warehouseApi';
import { Search, Filter, MapPin, Box, Thermometer, ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const WarehousePage = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        crop: '',
        location: '',
        minCapacity: ''
    });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const data = await getWarehouses(filters);
            setWarehouses(data.data);
        } catch (error) {
            console.error('Failed to fetch warehouses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchWarehouses();
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header / Slider Area - "Storage Marketplace" */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Storage Marketplace</h1>
                <p className="text-gray-600">Find and book secure storage for your crops. Supported by AI-driven capacity management.</p>

                <div className="flex gap-4 mt-6 overflow-x-auto pb-4">
                    {/* Summary Cards */}
                    <div className="min-w-[250px] p-4 bg-blue-600 text-white rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold">Verified Spaces</h3>
                        <p className="text-sm opacity-90">100% Secure & Insured</p>
                    </div>
                    <div className="min-w-[250px] p-4 bg-purple-600 text-white rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold">Cold Chain</h3>
                        <p className="text-sm opacity-90">Maintain freshness 2x longer</p>
                    </div>
                    <div className="min-w-[250px] p-4 bg-emerald-600 text-white rounded-xl shadow-lg">
                        <h3 className="text-lg font-semibold">Instant Booking</h3>
                        <p className="text-sm opacity-90">Paperless digital workflow</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by location (e.g., Pune)"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    />
                </div>
                <div className="w-48">
                    <input
                        type="text"
                        placeholder="Crop (e.g., Wheat)"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={filters.crop}
                        onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* Warehouse Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading warehouses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warehouses.map((w) => (
                        <motion.div
                            key={w._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                        >
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <img
                                    src={w.images && w.images.length > 0 ? (w.images[0].startsWith('http') ? w.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${w.images[0]}`) : 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80'}
                                    alt={w.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E"
                                    }}
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-premium-green shadow-sm">
                                    {w.specifications.type}
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-800 mb-1">{w.name}</h3>
                                <div className="flex items-center text-gray-500 text-sm mb-3">
                                    <MapPin className="w-4 h-4 mr-1" /> {w.location.city}, {w.location.state}
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400">Capacity</span>
                                        <span className="font-medium text-gray-700">{w.capacity.available} / {w.capacity.total} tons</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs text-gray-400">Rate/Day</span>
                                        <span className="font-bold text-green-600">₹{w.pricing.basePricePerTon}/ton</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 flex items-center gap-1">
                                        <Thermometer className="w-3 h-3" /> {w.specifications.type}
                                    </span>
                                    {w.specifications.facilities.slice(0, 2).map((fac, i) => (
                                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">
                                            {fac}
                                        </span>
                                    ))}
                                </div>

                                <Link
                                    to={`/warehouse/${w._id}`}
                                    className="block w-full text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WarehousePage;
