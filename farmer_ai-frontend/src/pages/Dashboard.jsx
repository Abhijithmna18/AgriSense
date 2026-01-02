import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/authApi';
import '../styles/admin.css';
import {
    ChevronDown,
    ChevronRight,
    AlertCircle,
    TrendingUp,
    Sprout,
    DollarSign,
    Package,
    Calendar,
    ArrowRight
} from 'lucide-react';

// Components
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FarmManagementCard from '../components/dashboard/FarmManagementCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeContext, setActiveContext] = useState('overview');
    const [expandedCards, setExpandedCards] = useState({});

    const contexts = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'operations', label: 'Operations', icon: Sprout },
        { id: 'finance', label: 'Finance', icon: DollarSign },
        { id: 'marketplace', label: 'Marketplace', icon: Package }
    ];

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await authAPI.getMe();
            setUser(response.data);
        } catch (err) {
            console.error("Auth failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        navigate('/login');
    };

    const toggleCard = (cardId) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg-primary)]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[var(--admin-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[var(--admin-text-primary)] font-serif tracking-wide">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex admin-layout">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative bg-[var(--admin-bg-primary)]">
                <TopBar user={user} onLogout={handleLogout} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto">

                        {/* Context Slider */}
                        <div className="mb-8 overflow-x-auto">
                            <div className="flex gap-2 pb-2">
                                {contexts.map((context) => {
                                    const Icon = context.icon;
                                    const isActive = activeContext === context.id;
                                    return (
                                        <button
                                            key={context.id}
                                            onClick={() => setActiveContext(context.id)}
                                            className={`
                                                flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all
                                                ${isActive
                                                    ? 'bg-[var(--admin-accent)] text-white shadow-lg'
                                                    : 'bg-[var(--admin-bg-secondary)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] border border-[var(--admin-border)]'
                                                }
                                            `}
                                        >
                                            <Icon size={18} />
                                            {context.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Dynamic Content Based on Context */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeContext}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {activeContext === 'overview' && (
                                    <>
                                        {/* Priority Card - Collapsible */}
                                        <div className="admin-card">
                                            <button
                                                onClick={() => toggleCard('priority')}
                                                className="w-full flex items-center justify-between hover:bg-[var(--admin-bg-hover)] transition-colors rounded p-2 -m-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                                        <AlertCircle className="text-[var(--admin-danger)]" size={20} />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-[var(--admin-text-primary)]">Priority Actions</h3>
                                                        <p className="text-sm text-[var(--admin-text-secondary)]">2 items require attention</p>
                                                    </div>
                                                </div>
                                                {expandedCards.priority ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            </button>

                                            <AnimatePresence>
                                                {expandedCards.priority && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="border-t border-[var(--admin-border)] mt-4 pt-4"
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between p-4 bg-[var(--admin-bg-hover)] rounded-xl">
                                                                <div>
                                                                    <p className="font-medium text-[var(--admin-text-primary)]">Soil Test Pending</p>
                                                                    <p className="text-sm text-[var(--admin-text-secondary)]">North Field - Due in 3 days</p>
                                                                </div>
                                                                <button className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--admin-accent-hover)] transition-colors">
                                                                    Schedule
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center justify-between p-4 bg-[var(--admin-bg-hover)] rounded-xl">
                                                                <div>
                                                                    <p className="font-medium text-[var(--admin-text-primary)]">Irrigation Review</p>
                                                                    <p className="text-sm text-[var(--admin-text-secondary)]">System efficiency check needed</p>
                                                                </div>
                                                                <button className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg text-sm font-medium hover:bg-[var(--admin-accent-hover)] transition-colors">
                                                                    Review
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Insight Card - Expandable */}
                                        <div className="admin-card">
                                            <button
                                                onClick={() => toggleCard('insights')}
                                                className="w-full flex items-center justify-between hover:bg-[var(--admin-bg-hover)] transition-colors rounded p-2 -m-2"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                        <TrendingUp className="text-[var(--admin-accent)]" size={20} />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-[var(--admin-text-primary)]">Performance Insights</h3>
                                                        <p className="text-sm text-[var(--admin-text-secondary)]">Click to view detailed analysis</p>
                                                    </div>
                                                </div>
                                                {expandedCards.insights ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                            </button>

                                            <AnimatePresence>
                                                {expandedCards.insights && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="border-t border-[var(--admin-border)] mt-4 pt-4"
                                                    >
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-[var(--admin-bg-hover)] rounded-xl border border-[var(--admin-border)]">
                                                                <p className="text-sm font-medium text-[var(--admin-text-primary)] mb-2">Yield Trend</p>
                                                                <p className="text-xs text-[var(--admin-text-secondary)]">Your average yield has increased by 12% compared to last season</p>
                                                            </div>
                                                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                                <p className="text-sm font-medium text-blue-900 mb-2">Resource Efficiency</p>
                                                                <p className="text-xs text-blue-700">Water usage optimized - 15% reduction while maintaining output</p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Farm Management Card - NEW */}
                                        <FarmManagementCard />

                                        {/* Action Cards Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button
                                                onClick={() => navigate('/recommendations')}
                                                className="group admin-card hover:border-[var(--admin-accent)] transition-all text-left"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                                        <Sprout className="text-[var(--admin-accent)]" size={24} />
                                                    </div>
                                                    <ArrowRight className="text-[var(--admin-text-muted)] group-hover:text-[var(--admin-accent)] group-hover:translate-x-1 transition-all" size={20} />
                                                </div>
                                                <h3 className="font-bold text-[var(--admin-text-primary)] mb-1">Get Crop Recommendations</h3>
                                                <p className="text-sm text-[var(--admin-text-secondary)]">AI-powered suggestions based on your soil and climate</p>
                                            </button>

                                            <button
                                                onClick={() => navigate('/marketplace')}
                                                className="group admin-card hover:border-[var(--admin-warning)] transition-all text-left"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                                                        <Package className="text-[var(--admin-warning)]" size={24} />
                                                    </div>
                                                    <ArrowRight className="text-[var(--admin-text-muted)] group-hover:text-[var(--admin-warning)] group-hover:translate-x-1 transition-all" size={20} />
                                                </div>
                                                <h3 className="font-bold text-[var(--admin-text-primary)] mb-1">Browse Marketplace</h3>
                                                <p className="text-sm text-[var(--admin-text-secondary)]">Buy inputs or sell your produce at best prices</p>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {activeContext === 'operations' && (
                                    <div className="space-y-4">
                                        <div className="admin-card">
                                            <h3 className="font-bold text-[var(--admin-text-primary)] mb-4">Field Operations</h3>
                                            <p className="text-sm text-[var(--admin-text-secondary)] mb-4">Manage your daily farming activities</p>
                                            <button className="w-full py-3 bg-[var(--admin-accent)] text-white rounded-xl font-medium hover:bg-[var(--admin-accent-hover)] transition-colors">
                                                View Operations
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeContext === 'finance' && (
                                    <div className="space-y-4">
                                        <div className="admin-card">
                                            <h3 className="font-bold text-[var(--admin-text-primary)] mb-4">Financial Overview</h3>
                                            <p className="text-sm text-[var(--admin-text-secondary)] mb-4">Track income, expenses, and schemes</p>
                                            <button className="w-full py-3 bg-[var(--admin-accent)] text-white rounded-xl font-medium hover:bg-[var(--admin-accent-hover)] transition-colors">
                                                View Finances
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeContext === 'marketplace' && (
                                    <div className="space-y-4">
                                        <div className="admin-card">
                                            <h3 className="font-bold text-[var(--admin-text-primary)] mb-4">Market Activity</h3>
                                            <p className="text-sm text-[var(--admin-text-secondary)] mb-4">Your orders and marketplace listings</p>
                                            <button className="w-full py-3 bg-[var(--admin-accent)] text-white rounded-xl font-medium hover:bg-[var(--admin-accent-hover)] transition-colors">
                                                Go to Marketplace
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
