import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, DollarSign, BarChart3, Edit, Trash2, MapPin, Tag, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/authApi';

const VendorDashboard = () => {
    const { user, activeRole, logout } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        productType: 'input', // 'input', 'crop'
        productRef: '',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        description: '',
        location: '',
        imageUrl: ''
    });

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    useEffect(() => {
        if (activeRole !== 'vendor') {
            // navigate('/dashboard'); // Optional: Redirect if not vendor active
        }
        fetchListings();
    }, [activeRole]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/marketplace/my-listings');
            setListings(data || []);
        } catch (error) {
            console.error('Failed to fetch listings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                images: formData.imageUrl ? [formData.imageUrl] : []
            };
            delete payload.imageUrl;

            await api.post('/api/marketplace/products', payload);
            fetchListings();
            setIsCreateModalOpen(false);
            setFormData({
                productType: 'input',
                productRef: '',
                quantity: '',
                unit: 'kg',
                pricePerUnit: '',
                description: '',
                location: '',
                imageUrl: ''
            });
        } catch (error) {
            console.error('Failed to create product', error);
            alert('Failed to list product');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await api.delete(`/api/marketplace/products/${id}`);
            fetchListings();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Simple Sidebar for context - or reuse Layout? reusing Layout is hard if not generic.
                We'll stick to a standalone page for now or simple layout.
            */}
            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
                            <p className="text-gray-500">Manage your store and listings</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2">
                                <LogOut size={18} />
                                Logout
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900 font-medium">
                                Back to Main Dashboard
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-200"
                            >
                                <Plus size={20} />
                                Add New Product
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Active Listings</p>
                                    <p className="text-2xl font-bold mt-1">{listings.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                                    <BarChart3 size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Sales</p>
                                    <p className="text-2xl font-bold mt-1">₹0</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending Payouts</p>
                                    <p className="text-2xl font-bold mt-1">₹0</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Listings Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">My Products</h2>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading listings...</div>
                        ) : listings.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Package className="mx-auto text-gray-300 mb-4" size={48} />
                                <p>No products listed yet. Click "Add New Product" to start selling.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 text-sm">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Product Name</th>
                                            <th className="px-6 py-4 font-medium">Type</th>
                                            <th className="px-6 py-4 font-medium">Price / Unit</th>
                                            <th className="px-6 py-4 font-medium">Stock</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {listings.map(item => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {typeof item.productRef === 'object' && item.productRef !== null
                                                        ? (item.productRef.name || item.productRef.variety || 'Unknown Product')
                                                        : item.productRef}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 capitalize">{item.productType}</td>
                                                <td className="px-6 py-4 text-gray-900 font-medium">₹{item.pricePerUnit} / {item.unit}</td>
                                                <td className="px-6 py-4 text-gray-600">{item.quantity}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {item.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-700 p-1">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Product Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Add New Product</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        value={formData.productType}
                                        onChange={e => setFormData({ ...formData, productType: e.target.value })}
                                    >
                                        <option value="input">Farming Input</option>
                                        <option value="crop">Crop Produce</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Category / Name</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g. Urea, Wheat Seeds"
                                        value={formData.productRef}
                                        onChange={e => setFormData({ ...formData, productRef: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Price</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        placeholder="₹"
                                        value={formData.pricePerUnit}
                                        onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Qty"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Unit</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="ton">ton</option>
                                        <option value="litre">litre</option>
                                        <option value="packet">packet</option>
                                        <option value="bag">bag</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500 h-24"
                                    placeholder="Product details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location (City)</label>
                                <input
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Optional (Default: Profile Address)"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Image URL</label>
                                <input
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Paste image link here..."
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>

                            <button className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200 mt-4">
                                List Product
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
