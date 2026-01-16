import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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
    ArrowRight,
    IndianRupee,
    Store
} from 'lucide-react';

// Components
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import FarmManagementCard from '../components/dashboard/FarmManagementCard';

// Buyer Components
import BuyerOverview from '../components/dashboard/buyer/BuyerOverview';
import SmartSourcingPanel from '../components/dashboard/buyer/SmartSourcingPanel';
// import ActiveNegotiations from '../components/dashboard/buyer/ActiveNegotiations';
import OrdersFulfillment from '../components/dashboard/buyer/OrdersFulfillment';
import SavedSuppliersWidget from '../components/dashboard/buyer/SavedSuppliersWidget';
import MarketInsightsWidget from '../components/dashboard/buyer/MarketInsightsWidget';

const Dashboard = ({ expectedRole }) => {
    const navigate = useNavigate();
    const { user, activeRole, switchRole, addRole, logout, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false); // Local loading state
    const [activeContext, setActiveContext] = useState('overview');
    const [expandedCards, setExpandedCards] = useState({});

    const contexts = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'operations', label: 'Operations', icon: Sprout }
    ];

    // Check for role mismatch
    if (expectedRole && activeRole && activeRole !== expectedRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--admin-bg-primary)]">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <AlertCircle size={48} className="mx-auto text-[var(--admin-warning)] mb-4" />
                    <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Role Mismatch</h2>
                    <p className="text-gray-600 mb-6">
                        You are currently active as <strong>{activeRole}</strong> but trying to access the <strong>{expectedRole}</strong> dashboard.
                    </p>

                    {user?.roles?.includes(expectedRole) ? (
                        <button
                            onClick={() => switchRole(expectedRole).then(() => navigate(0))} // Reload to refresh/redirect
                            className="bg-[var(--admin-accent)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[var(--admin-accent-hover)] w-full transition-colors"
                        >
                            Switch to {expectedRole}
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">You don't have the {expectedRole} role yet.</p>
                            <button
                                onClick={() => addRole(expectedRole).then(() => navigate(0))}
                                className="bg-[var(--admin-accent)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[var(--admin-accent-hover)] w-full transition-colors"
                            >
                                Become a {expectedRole}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleCard = (cardId) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    if (loading || authLoading) {
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
                {/* Role Context Banner */}
                <div className="bg-deep-charcoal text-white px-6 py-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="opacity-70">You are viewing:</span>
                        <span className="font-bold capitalize text-[var(--admin-accent)]">{activeRole} Dashboard</span>
                    </div>
                    {user?.roles?.length > 1 && (
                        <div className="flex gap-4">
                            {user.roles.filter(r => r !== activeRole && r !== 'admin').map(r => (
                                <button
                                    key={r}
                                    onClick={() => switchRole(r).then(() => navigate(`/${r}-dashboard`))}
                                    className="text-[var(--admin-accent)] hover:text-white transition-colors underline"
                                >
                                    Switch to {r}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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
                                <button
                                    onClick={() => navigate('/marketplace')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all bg-[var(--admin-accent)] text-white shadow-lg hover:bg-[var(--admin-accent-hover)]"
                                >
                                    Marketplace
                                </button>
                                <button
                                    onClick={() => navigate('/financial-services')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all bg-[var(--admin-accent)] text-white shadow-lg hover:bg-[var(--admin-accent-hover)]"
                                >
                                    <IndianRupee size={18} />
                                    Finance
                                </button>
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

                                        {/* Farmer-Specific Overview */}
                                        {activeRole === 'farmer' && (
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
                                            </>
                                        )}

                                        {/* Farm Management Card - Farmer Only */}
                                        {activeRole === 'farmer' && <FarmManagementCard />}

                                        {/* Buyer Specific Overview */}
                                        {activeRole === 'buyer' && (
                                            <div className="space-y-6 animate-fade-in">
                                                {/* Section A: KPI Overview */}
                                                <BuyerOverview />

                                                {/* Section B: Smart Sourcing & Market Insights */}
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    <div className="lg:col-span-2">
                                                        <SmartSourcingPanel />
                                                    </div>
                                                    <div className="lg:col-span-1">
                                                        <MarketInsightsWidget />
                                                    </div>
                                                </div>

                                                {/* Section C: Operations & Management */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <OrdersFulfillment />
                                                    <SavedSuppliersWidget />
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Cards Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Sell on AgriSense Card */}
                                            {!user?.roles?.includes('vendor') && (
                                                <button
                                                    onClick={() => navigate('/sell')}
                                                    className="group admin-card hover:border-blue-500 transition-all text-left"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                            <Store className="text-blue-500" size={24} />
                                                        </div>
                                                        <ArrowRight className="text-[var(--admin-text-muted)] group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
                                                    </div>
                                                    <h3 className="font-bold text-[var(--admin-text-primary)] mb-1">Become a Seller</h3>
                                                    <p className="text-sm text-[var(--admin-text-secondary)]">Register your business and reach more customers</p>
                                                </button>
                                            )}
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



                                {activeContext === 'marketplace' && (
                                    <div className="space-y-4">
                                        <div className="admin-card">
                                            <h3 className="font-bold text-[var(--admin-text-primary)] mb-4">Market Activity</h3>
                                            <p className="text-sm text-[var(--admin-text-secondary)] mb-4">Your orders and marketplace listings</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => navigate('/marketplace')}
                                                    className="w-full py-3 bg-[var(--admin-accent)] text-white rounded-xl font-medium hover:bg-[var(--admin-accent-hover)] transition-colors"
                                                >
                                                    Browse Market
                                                </button>
                                                <button
                                                    onClick={() => navigate('/marketplace/orders')}
                                                    className="w-full py-3 bg-[var(--admin-bg-secondary)] text-[var(--admin-text-primary)] border border-[var(--admin-border)] rounded-xl font-medium hover:bg-[var(--admin-bg-hover)] transition-colors"
                                                >
                                                    My Orders
                                                </button>
                                            </div>
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
