import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Calendar, ChevronDown, Download, Eye,
    Package, Truck, CheckCircle, XCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/authApi';

const BuyerOrdersPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Fetch Orders
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/marketplace/orders');
            setOrders(data);
            setFilteredOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    useEffect(() => {
        let result = orders;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(order =>
                order._id.toLowerCase().includes(lowerTerm) ||
                (order.seller?.businessName || '').toLowerCase().includes(lowerTerm) ||
                (order.items[0]?.productName || '').toLowerCase().includes(lowerTerm)
            );
        }

        if (statusFilter !== 'All') {
            result = result.filter(order =>
                order.deliveryStatus.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        setFilteredOrders(result);
    }, [searchTerm, statusFilter, orders]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700',
            shipped: 'bg-blue-100 text-blue-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen flex admin-layout">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative bg-[var(--admin-bg-primary)]">
                <TopBar user={user} onLogout={handleLogout} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                                <p className="text-sm text-gray-500">Track and manage your purchases</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => navigate('/marketplace')} className="bg-[var(--admin-accent)] text-white px-4 py-2 rounded-lg font-medium hover:bg-[var(--admin-accent-hover)] transition-colors flex items-center gap-2">
                                    <Package size={18} />
                                    Browse Marketplace
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 w-full md:max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID, Supplier, Product..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-white border border-slate-300 pl-4 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-gray-600" title="Refresh" onClick={fetchOrders}>
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-4 font-semibold">Order ID</th>
                                            <th className="p-4 font-semibold">Supplier</th>
                                            <th className="p-4 font-semibold">Items</th>
                                            <th className="p-4 font-semibold">Date</th>
                                            <th className="p-4 font-semibold">Total</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center text-gray-500">Loading orders...</td>
                                            </tr>
                                        ) : filteredOrders.length > 0 ? (
                                            filteredOrders.map((order) => (
                                                <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="p-4 font-mono text-sm font-medium text-blue-600">#{order._id.slice(-6).toUpperCase()}</td>
                                                    <td className="p-4 text-sm font-medium text-gray-800">
                                                        {order.seller?.businessName || order.seller?.firstName || 'Unknown Supplier'}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">
                                                        {order.items[0]?.productName}
                                                        {order.items.length > 1 && <span className="text-xs text-gray-400 ml-1">+{order.items.length - 1} more</span>}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-sm font-bold text-gray-800">₹{order.totalAmount}</td>
                                                    <td className="p-4">{getStatusBadge(order.deliveryStatus)}</td>
                                                    <td className="p-4 text-right">
                                                        <button className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50">
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Package className="text-slate-300 mb-3" size={48} />
                                                        <h3 className="text-lg font-bold text-slate-700">No orders found</h3>
                                                        <p className="text-slate-500 mb-4">You haven't placed any orders yet.</p>
                                                        <button onClick={() => navigate('/marketplace')} className="text-blue-600 font-medium hover:underline">
                                                            Start Shopping
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BuyerOrdersPage;
