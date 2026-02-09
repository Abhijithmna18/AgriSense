import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, DollarSign, BarChart3, Edit, Trash2, MapPin, Tag, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/authApi';

const VendorDashboard = () => {
    const { user, activeRole, logout } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        category: 'inputs', // 'inputs', 'rentals'
        productType: '', // Free text input
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

    const [editingProduct, setEditingProduct] = useState(null);
    const [imageSource, setImageSource] = useState('url'); // 'url' or 'file'
    const [imageFile, setImageFile] = useState(null);

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            category: product.category || 'inputs',
            productType: product.productType || '',
            productRef: product.name || '',
            quantity: product.quantity || '',
            unit: product.unit || 'kg',
            pricePerUnit: product.pricePerUnit || '',
            description: product.description || '',
            location: product.location || '',
            imageUrl: product.images?.[0] || ''
        });
        setImageSource('url');
        setImageFile(null);
        setIsCreateModalOpen(true);
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        try {
            const formDataObj = new FormData();

            // Append Text Fields
            formDataObj.append('category', formData.category);
            formDataObj.append('productType', formData.productType);
            formDataObj.append('productRef', formData.productRef);
            formDataObj.append('quantity', formData.quantity);
            formDataObj.append('unit', formData.unit);
            formDataObj.append('pricePerUnit', formData.pricePerUnit);
            formDataObj.append('description', formData.description);
            formDataObj.append('location', formData.location);

            // Append Image
            if (imageSource === 'file' && imageFile) {
                formDataObj.append('images', imageFile);
            } else if (imageSource === 'url' && formData.imageUrl) {
                formDataObj.append('images', formData.imageUrl);
            }

            if (editingProduct) {
                await api.put(`/api/marketplace/products/${editingProduct._id}`, formDataObj);
                alert('Product updated successfully');
            } else {
                await api.post('/api/marketplace/products', formDataObj);
                alert('Product created successfully');
            }

            fetchListings();
            setIsCreateModalOpen(false);
            setEditingProduct(null);
            setFormData({
                category: 'inputs',
                productType: '',
                productRef: '',
                quantity: '',
                unit: 'kg',
                pricePerUnit: '',
                description: '',
                location: '',
                imageUrl: ''
            });
            setImageFile(null);
            setImageSource('url');
        } catch (error) {
            console.error('Failed to save product', error);
            const msg = error.response?.data?.message || 'Failed to save product';
            alert(msg);
        }
    };

    // ... existing handleDelete ...

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await api.delete(`/api/marketplace/products/${id}`);
            fetchListings();
        } catch (error) {
            console.error('Failed to delete', error);
            if (error.response?.status === 403) {
                alert('You do not have permission to delete this product. Please make sure you are logged in as a vendor and this is your product.');
            } else {
                alert('Failed to delete product. Please try again.');
            }
        }
    };

    // Helper to render image source
    const getProductImageSrc = (product) => {
        if (product.images && product.images.length > 0) {
            const img = product.images[0];
            if (img.startsWith('http') || img.startsWith('data:')) return img;
            // Clean path to ensure it doesn't double slash if not needed, but simplified:
            // Backend saves as 'uploads/filename.ext'
            // We want to access '/uploads/filename.ext' relative to domain
            return `/${img.startsWith('/') ? img.slice(1) : img}`;
        }
        return null;
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
                            <button
                                onClick={() => navigate('/vendor/negotiations')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                            >
                                <MessageSquare size={20} />
                                Negotiations
                            </button>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 font-medium flex items-center gap-2">
                                <LogOut size={18} />
                                Logout
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900 font-medium">
                                Back to Main Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setFormData({
                                        category: 'inputs',
                                        productType: '',
                                        productRef: '',
                                        quantity: '',
                                        unit: 'kg',
                                        pricePerUnit: '',
                                        description: '',
                                        location: '',
                                        imageUrl: ''
                                    });
                                    setImageSource('url');
                                    setImageFile(null);
                                    setIsCreateModalOpen(true);
                                }}
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

                    {/* Quick Start Section - Only show when no products */}
                    {!loading && listings.length === 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200 mb-8">
                            <div className="max-w-3xl mx-auto text-center space-y-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                                    <Package className="text-white" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Start Selling Your Products</h2>
                                <p className="text-gray-600 text-lg">
                                    Welcome to the Vendor Marketplace! List your farming inputs, equipment, or produce to reach farmers across the region.
                                </p>

                                {/* Quick Start Steps */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3 mx-auto">1</div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Add Product Details</h3>
                                        <p className="text-sm text-gray-600">Enter product name, type, price, and quantity</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3 mx-auto">2</div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Set Your Price</h3>
                                        <p className="text-sm text-gray-600">Choose competitive pricing per unit</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3 mx-auto">3</div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Start Earning</h3>
                                        <p className="text-sm text-gray-600">Receive orders and manage your sales</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-6 px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg flex items-center gap-3 hover:bg-green-700 transition shadow-lg shadow-green-200 mx-auto"
                                >
                                    <Plus size={24} />
                                    List Your First Product
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Listings Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">My Products</h2>
                            {listings.length > 0 && (
                                <button
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setFormData({
                                            category: 'inputs',
                                            productType: '',
                                            productRef: '',
                                            quantity: '',
                                            unit: 'kg',
                                            pricePerUnit: '',
                                            description: '',
                                            location: '',
                                            imageUrl: ''
                                        });
                                        setImageSource('url');
                                        setImageFile(null);
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-700 transition text-sm"
                                >
                                    <Plus size={18} />
                                    Add Product
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-500">Loading listings...</div>
                        ) : listings.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Package className="mx-auto text-gray-300 mb-4" size={48} />
                                <p>Your product listings will appear here.</p>
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
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {/* Product Image */}
                                                        {item.images && item.images.length > 0 && item.images[0] ? (
                                                            <img
                                                                src={getProductImageSrc(item) || 'https://placehold.co/48x48?text=No+Img'}
                                                                alt={item.name || 'Product'}
                                                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                                onError={(e) => {
                                                                    // Hide image and show icon fallback
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Fallback Icon - shown when no image or image fails */}
                                                        <div
                                                            className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200"
                                                            style={{ display: (item.images && item.images.length > 0 && item.images[0]) ? 'none' : 'flex' }}
                                                        >
                                                            <Package size={20} className="text-gray-400" />
                                                        </div>
                                                        {/* Product Name */}
                                                        <span className="font-medium text-gray-900">
                                                            {item.name || 'Unnamed Product'}
                                                        </span>
                                                    </div>
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
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-blue-600 hover:text-blue-800 p-1"
                                                    >
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

            {/* Create/Edit Product Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitProduct} className="space-y-4">
                            {/* Category Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Marketplace Category</label>
                                <select
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="inputs">Farming Inputs (Seeds, Fertilizers, Pesticides)</option>
                                    <option value="rentals">Tools & Rentals (Tractors, Equipment)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Product Type</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g. Seeds, Fertilizer, Equipment"
                                        value={formData.productType}
                                        onChange={e => {
                                            // Prevent leading spaces
                                            const value = e.target.value;
                                            if (value.length === 0 || value[0] !== ' ') {
                                                setFormData({ ...formData, productType: value });
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Product Name</label>
                                    <input
                                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        placeholder="e.g. Urea, Wheat Seeds, Tractor"
                                        value={formData.productRef}
                                        onChange={e => {
                                            // Prevent leading spaces
                                            const value = e.target.value;
                                            if (value.length === 0 || value[0] !== ' ') {
                                                setFormData({ ...formData, productRef: value });
                                            }
                                        }}
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
                                    onChange={e => {
                                        // Prevent leading spaces
                                        const value = e.target.value;
                                        if (value.length === 0 || value[0] !== ' ') {
                                            setFormData({ ...formData, description: value });
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Location (City)</label>
                                <input
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Optional (Default: Profile Address)"
                                    value={formData.location}
                                    onChange={e => {
                                        // Prevent leading spaces
                                        const value = e.target.value;
                                        if (value.length === 0 || value[0] !== ' ') {
                                            setFormData({ ...formData, location: value });
                                        }
                                    }}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Product Image</label>

                                <div className="flex gap-4 mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="imageSource"
                                            value="url"
                                            checked={imageSource === 'url'}
                                            onChange={() => setImageSource('url')}
                                            className="text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Image URL</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="imageSource"
                                            value="file"
                                            checked={imageSource === 'file'}
                                            onChange={() => setImageSource('file')}
                                            className="text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Upload from Computer</span>
                                    </label>
                                </div>

                                {imageSource === 'url' ? (
                                    <input
                                        className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Paste image link here..."
                                        value={formData.imageUrl}
                                        onChange={e => {
                                            // Prevent leading spaces
                                            const value = e.target.value;
                                            if (value.length === 0 || value[0] !== ' ') {
                                                setFormData({ ...formData, imageUrl: value });
                                            }
                                        }}
                                    />
                                ) : (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files[0])}
                                        className="w-full p-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500 text-sm"
                                    />
                                )}
                            </div>

                            <button className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200 mt-4">
                                {editingProduct ? 'Update Product' : 'List Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorDashboard;
