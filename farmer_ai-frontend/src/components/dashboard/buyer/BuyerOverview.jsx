import React, { useState, useEffect } from 'react';
import { ShoppingBag, MessageSquare, Heart, IndianRupee, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../../services/authApi';

const BuyerOverview = () => {
    const [stats, setStats] = useState({
        activeOrders: 0,
        negotiations: 0,
        savedSuppliers: 0,
        monthlySpend: 0,
        avgDelivery: 'N/A'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/marketplace/orders');

                const active = data.filter(o => o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'cancelled').length;
                const pending = data.filter(o => o.paymentStatus === 'pending').length;

                // Calculate Monthly Spend
                const currentMonth = new Date().getMonth();
                const spend = data
                    .filter(o => new Date(o.createdAt).getMonth() === currentMonth)
                    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

                // Unique suppliers (simplified approximation for "Saved Suppliers")
                const suppliers = new Set(data.map(o => o.seller?._id || o.seller)).size;

                setStats({
                    activeOrders: active,
                    negotiations: pending,
                    savedSuppliers: suppliers,
                    monthlySpend: spend,
                    avgDelivery: '2.5 Days' // Placeholder logic not trivial
                });
            } catch (error) {
                console.error("Failed to fetch overview stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const kpis = [
        { label: 'Active Orders', value: loading ? '...' : stats.activeOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'Live', trendColor: 'text-green-600' },
        { label: 'Suppliers Interacted', value: loading ? '...' : stats.savedSuppliers, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100', trend: 'Network', trendColor: 'text-blue-600' },
        { label: 'Monthly Spend', value: loading ? '...' : `₹${(stats.monthlySpend / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: 'This Month', trendColor: 'text-gray-500' },
        { label: 'Avg Delivery', value: stats.avgDelivery, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'Est.', trendColor: 'text-green-600' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpis.map((kpi, index) => (
                <div key={index} className="admin-card hover:border-blue-200 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-lg ${kpi.bg}`}>
                            <kpi.icon size={20} className={kpi.color} />
                        </div>
                        <span className={`text-xs font-medium ${kpi.trendColor} flex items-center`}>
                            {kpi.trend}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {kpi.value}
                    </h3>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                </div>
            ))}
        </div>
    );
};

export default BuyerOverview;
