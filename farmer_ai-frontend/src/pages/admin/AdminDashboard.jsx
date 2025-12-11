import React, { useEffect, useState } from 'react';
import { Users, Sprout, AlertTriangle, Activity, ChevronRight, ShieldCheck } from 'lucide-react';
import CompactMetric from '../../components/admin/CompactMetric';
import AdminTopBar from '../../components/admin/AdminTopBar';
import adminApi from '../../services/adminApi';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        farms: 0,
        pendingModeration: 0,
        systemHealth: 'Loading...'
    });
    // const [loading, setLoading] = useState(true); // Kept unused or used if expanded

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Determine if we should use mock data - DISABLED for prod/clean look
                // const useMock = import.meta.env.VITE_USE_MOCK === 'true'; 

                const res = await adminApi.get('/admin/summary');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);

                // Fallback to empty state
                setStats({
                    users: '-',
                    farms: '-',
                    pendingModeration: '-',
                    systemHealth: 'Scanning...'
                });
            } finally {
                // setLoading(false);
            }
        };

        fetchStats();
    }, []);

    // Empty state for activity
    // const activityLog = [];

    return (
        <div className="space-y-8">
            <AdminTopBar title="Overview" />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CompactMetric
                    label="Total Users"
                    value={stats.users || '-'}
                    icon={Users}
                />
                <CompactMetric
                    label="Active Farms"
                    value={stats.farms || '-'}
                    icon={Sprout}
                />
                <CompactMetric
                    label="Pending Review"
                    value={stats.pendingModeration || '-'}
                    icon={AlertTriangle}
                />
                <CompactMetric
                    label="System Health"
                    value={stats.systemHealth}
                    icon={Activity}
                />
            </div>

            {/* Activity & Quick Actions Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area (Activity Stream - Empty State) */}
                <div className="lg:col-span-2 admin-card min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[var(--admin-text-primary)]">Live Activity</h3>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--admin-border)] rounded-xl bg-[var(--admin-bg-primary)]/30">
                        <div className="p-4 rounded-full bg-[var(--admin-bg-hover)] mb-4 animate-pulse">
                            <ShieldCheck className="text-[var(--admin-text-muted)]" size={32} />
                        </div>
                        <p className="text-[var(--admin-text-secondary)] font-medium">No recent activity</p>
                        <p className="text-[var(--admin-text-muted)] text-sm mt-1">System events will appear here in real-time</p>
                    </div>
                </div>

                {/* Side Panel (Quick Actions - Empty/Ready State) */}
                <div className="space-y-8">
                    <div className="admin-card">
                        <h3 className="text-lg font-bold text-[var(--admin-text-primary)] mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3.5 rounded-xl bg-[var(--admin-bg-primary)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-hover)] border border-transparent hover:border-[var(--admin-border)] transition-all font-medium flex items-center justify-between group">
                                <span>Create Announcement</span>
                                <ChevronRight size={16} className="text-[var(--admin-text-muted)] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full text-left px-4 py-3.5 rounded-xl bg-[var(--admin-bg-primary)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-hover)] border border-transparent hover:border-[var(--admin-border)] transition-all font-medium flex items-center justify-between group">
                                <span>Review Content</span>
                                <ChevronRight size={16} className="text-[var(--admin-text-muted)] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="w-full text-left px-4 py-3.5 rounded-xl bg-[var(--admin-bg-primary)] text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-hover)] border border-transparent hover:border-[var(--admin-border)] transition-all font-medium flex items-center justify-between group">
                                <span>Manage Features</span>
                                <ChevronRight size={16} className="text-[var(--admin-text-muted)] group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="admin-card border border-[var(--admin-border)] bg-[var(--admin-bg-secondary)]">
                        <h3 className="text-lg font-bold text-[var(--admin-text-primary)] mb-4">System Status</h3>

                        {/* Empty Status Placeholders */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                                    <span>Server Load</span>
                                    <span>--%</span>
                                </div>
                                <div className="w-full bg-[var(--admin-bg-hover)] rounded-full h-1.5"></div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                                    <span>Database</span>
                                    <span>--%</span>
                                </div>
                                <div className="w-full bg-[var(--admin-bg-hover)] rounded-full h-1.5"></div>
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--admin-border)]">
                                <div className="w-2 h-2 rounded-full bg-[var(--admin-text-muted)]"></div>
                                <span className="text-xs text-[var(--admin-text-muted)]">Waiting for metrics...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
