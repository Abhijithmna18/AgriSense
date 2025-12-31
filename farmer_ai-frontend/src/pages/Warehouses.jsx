import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Warehouse, MapPin, Package, Thermometer, Search, Filter, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import * as warehouseApi from '../services/warehouseApi';
import { authAPI } from '../services/authApi';

const Warehouses = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        cropType: '',
        quantity: '',
        city: '',
        storageCondition: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const userRes = await authAPI.getMe();
            setUser(userRes.data);
            await fetchWarehouses();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouses = async (customFilters = {}) => {
        try {
            const activeFilters = { ...filters, ...customFilters };
            // Remove empty filters
            Object.keys(activeFilters).forEach(key => {
                if (!activeFilters[key]) delete activeFilters[key];
            });

            const response = await warehouseApi.getWarehouses(activeFilters);
            setWarehouses(response.data || []);
        } catch (err) {
            console.error('Error fetching warehouses:', err);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
    };

    const handleSearch = () => {
        fetchWarehouses();
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        navigate('/login');
    };

    const getStorageIcon = (condition) => {
        switch (condition) {
            case 'refrigerated': return '❄️';
            case 'frozen': return '🧊';
            default: return '🌡️';
        }
    };

    return (
        <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest transition-colors flex">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
                <TopBar user={user} onLogout={handleLogout} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto space-y-8">

                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-primary-green to-emerald-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                            <div className="relative z-10">
                                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                                    Storage Marketplace
                                </h1>
                                <p className="text-xl text-white/90 mb-6 max-w-2xl">
                                    Secure, certified warehouses for your harvest. Book storage space with transparent pricing and 24/7 monitoring.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{warehouses.length}+</p>
                                            <p className="text-sm text-white/80">Certified Warehouses</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">24/7</p>
                                            <p className="text-sm text-white/80">Support & Monitoring</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">100%</p>
                                            <p className="text-sm text-white/80">Secure Storage</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Search & Filters */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-white/5 rounded-2xl p-6 shadow-sm border border-stone-200 dark:border-white/10"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Filter size={20} className="text-primary-green" />
                                <h2 className="text-lg font-bold text-dark-green-text dark:text-warm-ivory">Search Warehouses</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Crop Type</label>
                                    <select
                                        value={filters.cropType}
                                        onChange={(e) => handleFilterChange('cropType', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                                    >
                                        <option value="">All Types</option>
                                        <option value="grain">Grain</option>
                                        <option value="spice">Spice</option>
                                        <option value="vegetable">Vegetable</option>
                                        <option value="fruit">Fruit</option>
                                        <option value="pulses">Pulses</option>
                                        <option value="oilseeds">Oilseeds</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Quantity (tons)</label>
                                    <input
                                        type="number"
                                        value={filters.quantity}
                                        onChange={(e) => handleFilterChange('quantity', e.target.value)}
                                        placeholder="Min capacity"
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={filters.city}
                                        onChange={(e) => handleFilterChange('city', e.target.value)}
                                        placeholder="City"
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Storage Type</label>
                                    <select
                                        value={filters.storageCondition}
                                        onChange={(e) => handleFilterChange('storageCondition', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                                    >
                                        <option value="">All Conditions</option>
                                        <option value="ambient">Ambient</option>
                                        <option value="refrigerated">Refrigerated</option>
                                        <option value="frozen">Frozen</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handleSearch}
                                className="mt-4 w-full md:w-auto px-8 py-3 bg-primary-green text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Search size={20} />
                                Search Warehouses
                            </button>
                        </motion.div>

                        {/* Warehouse Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {warehouses.map((warehouse, idx) => (
                                <motion.div
                                    key={warehouse._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-sm border border-stone-200 dark:border-white/10 hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/warehouse/${warehouse._id}`)}
                                >
                                    {/* Image */}
                                    <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20">
                                        {warehouse.images && warehouse.images.length > 0 ? (
                                            <img
                                                src={warehouse.images[0].startsWith('http') ? warehouse.images[0] : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${warehouse.images[0]}`}
                                                alt={warehouse.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <Warehouse size={64} className="text-primary-green opacity-50" />
                                        )}
                                        <div className="absolute top-4 right-4 bg-white dark:bg-black/40 px-3 py-1 rounded-full text-xs font-bold">
                                            {warehouse.capacity.available > 0 ? (
                                                <span className="text-green-600">Available</span>
                                            ) : (
                                                <span className="text-red-600">Full</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {warehouse.name}
                                        </h3>

                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                                            <MapPin size={16} />
                                            {warehouse.location.city}, {warehouse.location.state}
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Available Capacity</span>
                                                <span className="font-bold text-primary-green">{warehouse.capacity.available} tons</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Starting Price</span>
                                                <span className="font-bold">₹{warehouse.pricing.basePricePerTon}/ton/day</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 flex-wrap mb-4">
                                            <span className="text-xs bg-stone-100 dark:bg-white/10 px-2 py-1 rounded flex items-center gap-1">
                                                {getStorageIcon(warehouse.specifications.type)}
                                                {warehouse.specifications.type}
                                            </span>
                                            {warehouse.specifications.supportedCrops && warehouse.specifications.supportedCrops.slice(0, 2).map(crop => (
                                                <span key={crop} className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded">
                                                    {crop}
                                                </span>
                                            ))}
                                        </div>

                                        <button className="w-full py-3 bg-primary-green text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {warehouses.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">No warehouses found matching your criteria</p>
                                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Warehouses;
