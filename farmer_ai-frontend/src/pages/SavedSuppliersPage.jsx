import React, { useState, useEffect } from 'react';
import { Heart, Search, MapPin, Star, ShoppingBag, Phone, Mail, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SavedSuppliersPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        location: '',
        supplierType: '',
        minRating: ''
    });

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchSavedSuppliers();
    }, [isAuthenticated, navigate]);

    const fetchSavedSuppliers = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use the correct token key from AuthContext
            const authToken = localStorage.getItem('auth_token');
            
            if (!authToken) {
                navigate('/login');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            const response = await fetch(`${apiUrl}/api/marketplace/saved-suppliers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token is invalid, redirect to login
                    localStorage.removeItem('auth_token');
                    navigate('/login');
                    return;
                }
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`Failed to fetch saved suppliers: ${response.status}`);
            }

            const data = await response.json();
            setSuppliers(data.suppliers || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const removeSavedSupplier = async (supplierId) => {
        try {
            const authToken = localStorage.getItem('auth_token');
            
            if (!authToken) {
                navigate('/login');
                return;
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
            const response = await fetch(`${apiUrl}/api/marketplace/saved-suppliers/${supplierId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('auth_token');
                    navigate('/login');
                    return;
                }
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`Failed to remove supplier: ${response.status}`);
            }

            // Remove from local state
            setSuppliers(suppliers.filter(supplier => supplier.supplier._id !== supplierId));
        } catch (err) {
            console.error('Remove error:', err);
            setError(err.message);
        }
    };

    const filteredSuppliers = suppliers.filter(saved => {
        const supplier = saved.supplier;
        const matchesSearch = supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supplier.businessName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesLocation = !filters.location || 
                              supplier.location?.toLowerCase().includes(filters.location.toLowerCase());
        
        const matchesType = !filters.supplierType || supplier.supplierType === filters.supplierType;
        
        const matchesRating = !filters.minRating || saved.averageRating >= parseFloat(filters.minRating);

        return matchesSearch && matchesLocation && matchesType && matchesRating;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading saved suppliers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchSavedSuppliers}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Suppliers</h1>
                    <p className="text-gray-600">Manage your trusted supplier network</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search suppliers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <input
                                type="text"
                                placeholder="Location"
                                value={filters.location}
                                onChange={(e) => setFilters({...filters, location: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Supplier Type Filter */}
                        <div>
                            <select
                                value={filters.supplierType}
                                onChange={(e) => setFilters({...filters, supplierType: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value="farmer">Farmer</option>
                                <option value="vendor">Vendor</option>
                                <option value="distributor">Distributor</option>
                            </select>
                        </div>

                        {/* Rating Filter */}
                        <div>
                            <select
                                value={filters.minRating}
                                onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Any Rating</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Suppliers Grid */}
                {filteredSuppliers.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved suppliers</h3>
                        <p className="text-gray-600 mb-4">
                            {suppliers.length === 0 
                                ? "You haven't saved any suppliers yet. Start exploring the marketplace!"
                                : "No suppliers match your current filters."
                            }
                        </p>
                        {suppliers.length === 0 && (
                            <button 
                                onClick={() => window.location.href = '/marketplace'}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                            >
                                Browse Marketplace
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSuppliers.map((saved) => {
                            const supplier = saved.supplier;
                            return (
                                <div key={saved._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Header */}
                                    <div className="p-6 pb-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {supplier.businessName || supplier.name}
                                                </h3>
                                                <p className="text-sm text-gray-600 capitalize">
                                                    {supplier.supplierType || supplier.role}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeSavedSupplier(supplier._id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Remove from saved"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Rating */}
                                        {saved.averageRating && (
                                            <div className="flex items-center mb-3">
                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                <span className="ml-1 text-sm font-medium text-gray-900">
                                                    {saved.averageRating.toFixed(1)}
                                                </span>
                                                <span className="ml-1 text-sm text-gray-500">
                                                    ({saved.totalReviews} reviews)
                                                </span>
                                            </div>
                                        )}

                                        {/* Location */}
                                        {supplier.location && (
                                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {supplier.location}
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {saved.totalOrders || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">Orders</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    ₹{((saved.totalSpent || 0) / 1000).toFixed(1)}k
                                                </div>
                                                <div className="text-xs text-gray-500">Total Spent</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <div className="flex space-x-2">
                                            <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center">
                                                <ShoppingBag className="h-4 w-4 mr-1" />
                                                Order
                                            </button>
                                            {supplier.phone && (
                                                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                    <Phone className="h-4 w-4" />
                                                </button>
                                            )}
                                            {supplier.email && (
                                                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                    <Mail className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Saved Date */}
                                    <div className="px-6 py-2 text-xs text-gray-500 border-t border-gray-100">
                                        Saved on {new Date(saved.savedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedSuppliersPage;