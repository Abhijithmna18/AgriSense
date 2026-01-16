import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, IndianRupee, TrendingUp } from 'lucide-react';
import ListingsTable from '../../components/admin/marketplace/ListingsTable';
import OrdersTable from '../../components/admin/marketplace/OrdersTable';
import PaymentsLedger from '../../components/admin/marketplace/PaymentsLedger';
import { getMarketplaceStats } from '../../services/adminApi';

const MarketplaceAdmin = () => {
    const [activeTab, setActiveTab] = useState('listings');
    const [stats, setStats] = useState({
        listings: { total: 0 },
        orders: { active: 0, total: 0 },
        gmv: 0,
        pendingActions: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getMarketplaceStats();
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-serif text-[var(--admin-text-primary)]">Marketplace Administration</h1>
                <p className="text-[var(--admin-text-secondary)] mt-1">Manage listings, orders, and financial verification</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--admin-border)] flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><Package /></div>
                    <div><p className="text-sm text-gray-500">Listings</p><p className="text-xl font-bold">{stats.listings.total}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--admin-border)] flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600"><ShoppingCart /></div>
                    <div><p className="text-sm text-gray-500">Active Orders</p><p className="text-xl font-bold">{stats.orders.active}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--admin-border)] flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600"><IndianRupee /></div>
                    <div><p className="text-sm text-gray-500">Total GMV</p><p className="text-xl font-bold">₹{stats.gmv.toLocaleString()}</p></div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-[var(--admin-border)] flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600"><TrendingUp /></div>
                    <div><p className="text-sm text-gray-500">Pending Actions</p><p className="text-xl font-bold">{stats.pendingActions}</p></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('listings')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'listings' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Listings Management
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Orders & Fulfillment
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'payments' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Payments Ledger
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'listings' && <ListingsTable />}
                {activeTab === 'orders' && <OrdersTable />}
                {activeTab === 'payments' && <PaymentsLedger />}
            </div>
        </div>
    );
};

export default MarketplaceAdmin;
