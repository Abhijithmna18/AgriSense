import React, { useEffect, useState } from 'react';
import { Users, Sprout, AlertTriangle, Activity, ChevronRight, ShieldCheck, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CompactMetric from '../../components/admin/CompactMetric';
import AdminTopBar from '../../components/admin/AdminTopBar';
import adminApi from '../../services/adminApi';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        farms: 0,
        orders: 0,
        revenue: 0,
        topCrops: [],
        diseaseScansByRegion: [],
        activeUsers: [],
        systemHealth: 'Loading...'
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await adminApi.get('/admin/summary');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
                setStats({
                    users: '-', farms: '-', orders: '-', revenue: '-',
                    topCrops: [], diseaseScansByRegion: [], activeUsers: [],
                    systemHealth: 'Offline'
                });
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (val) => {
        if (isNaN(val)) return val;
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-8">
            <AdminTopBar title="Overview" />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <CompactMetric label="Total Users" value={stats.users || '-'} icon={Users} />
                <CompactMetric label="Active Farms" value={stats.farms || '-'} icon={Sprout} />
                <CompactMetric label="Total Orders" value={stats.orders || '-'} icon={ShoppingCart} />
                <CompactMetric label="Total Revenue" value={formatCurrency(stats.revenue) || '-'} icon={DollarSign} />
            </div>

            {/* Charts Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Crops Bar Chart */}
                <div className="admin-card min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-[var(--admin-text-primary)] mb-6 flex items-center gap-2">
                        <TrendingUp className="text-[var(--admin-accent)]" size={20} />
                        Top Selling Crops
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        {stats.topCrops?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topCrops} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--admin-text-secondary)' }} />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: 'var(--admin-text-secondary)' }} />
                                    <Tooltip
                                        formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Quantity Sold']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-primary)', color: 'var(--admin-text-primary)' }}
                                    />
                                    <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Quantity Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--admin-text-muted)] border-2 border-dashed border-[var(--admin-border)] rounded-xl">No order data available</div>
                        )}
                    </div>
                </div>

                {/* Disease Scans Pie Chart */}
                <div className="admin-card min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-[var(--admin-text-primary)] mb-6 flex items-center gap-2">
                        <Activity className="text-emerald-500" size={20} />
                        Disease Scans By Region
                    </h3>
                    <div className="flex-1 min-h-[300px]">
                        {stats.diseaseScansByRegion?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.diseaseScansByRegion}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="region"
                                        label={({ region, percent }) => `${region} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.diseaseScansByRegion.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-primary)', color: 'var(--admin-text-primary)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--admin-text-muted)] border-2 border-dashed border-[var(--admin-border)] rounded-xl">No scan data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Most Active Users and System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Most Active Users Table */}
                <div className="lg:col-span-2 admin-card">
                    <h3 className="text-lg font-bold text-[var(--admin-text-primary)] mb-6 flex items-center gap-2">
                        <Users className="text-blue-500" size={20} />
                        Most Active Buyers
                    </h3>
                    {stats.activeUsers?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[var(--admin-border)] text-sm text-[var(--admin-text-muted)]">
                                        <th className="pb-3 font-medium">User</th>
                                        <th className="pb-3 font-medium">Email</th>
                                        <th className="pb-3 font-medium text-right">Orders Placed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.activeUsers.map((user, idx) => (
                                        <tr key={idx} className="border-b border-[var(--admin-border)] last:border-0 hover:bg-[var(--admin-bg-hover)] transition-colors">
                                            <td className="py-4 text-[var(--admin-text-primary)] font-medium">
                                                {user.name}
                                            </td>
                                            <td className="py-4 text-[var(--admin-text-secondary)]">
                                                {user.email}
                                            </td>
                                            <td className="py-4 text-[var(--admin-text-primary)] font-bold text-right">
                                                {user.ordersCount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-[var(--admin-text-muted)] border-2 border-dashed border-[var(--admin-border)] rounded-xl">
                            No active users detected yet
                        </div>
                    )}
                </div>

                {/* System Status Sidebar */}
                <div className="admin-card border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)]">
                    <h3 className="text-lg font-bold text-[var(--admin-text-primary)] mb-4 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500" size={20} />
                        System Status
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                                <span>Platform Health</span>
                                <span className={stats.systemHealth === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}>
                                    {stats.systemHealth}
                                </span>
                            </div>
                            <div className="w-full bg-[var(--admin-bg-hover)] rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${stats.systemHealth === 'Healthy' ? 'bg-emerald-500 w-full' : 'bg-amber-500 w-1/2'}`}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                                <span>Server Load</span>
                                <span>34%</span>
                            </div>
                            <div className="w-full bg-[var(--admin-bg-hover)] rounded-full h-1.5">
                                <div className="bg-blue-500 w-[34%] h-1.5 rounded-full"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                                <span>Database Capacity</span>
                                <span>12%</span>
                            </div>
                            <div className="w-full bg-[var(--admin-bg-hover)] rounded-full h-1.5">
                                <div className="bg-purple-500 w-[12%] h-1.5 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
