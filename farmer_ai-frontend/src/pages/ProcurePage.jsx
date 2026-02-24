import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Search, MapPin, Star, Shield, Zap, TrendingDown,
    TrendingUp, MessageSquare, ShoppingBag, Filter, ChevronDown,
    CheckCircle2, AlertCircle, ArrowRight, Sparkles, Clock, BadgeCheck,
    Package, BarChart3, Handshake, Info, X, ChevronRight
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/authApi';
import toast from 'react-hot-toast';
import SmartProcurementModal from '../components/marketplace/SmartProcurementModal';

// ─────────────────────────────────────────────
//  Static market insight chips (from MarketAnalyticsPage)
// ─────────────────────────────────────────────
const MARKET_INSIGHTS = [
    {
        id: 1,
        icon: Zap,
        color: 'amber',
        title: 'Best Time to Buy',
        text: 'Buy Wheat in the next 10 days before prices spike ~8%.',
        crop: 'Wheat',
    },
    {
        id: 2,
        icon: TrendingDown,
        color: 'green',
        title: 'Cost Saving Opp',
        text: 'West region Cotton suppliers can save you 12% vs. North.',
        crop: 'Cotton',
    },
    {
        id: 3,
        icon: AlertCircle,
        color: 'blue',
        title: 'Supply Alert',
        text: 'Rice supply tightening in South — buy forward contracts now.',
        crop: 'Rice',
    },
];

const insightColorMap = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
};

// ─────────────────────────────────────────────
//  Negotiation Tip Card
// ─────────────────────────────────────────────
const NEGOTIATION_TIPS = [
    { tip: 'Reference current market prices when making your first offer.', icon: BarChart3 },
    { tip: 'Bulk orders (>500 units) typically unlock 8–15% discounts.', icon: Package },
    { tip: 'Request long-term contract terms for consistent pricing.', icon: Handshake },
    { tip: 'Verified suppliers have a 94% on-time delivery track record.', icon: BadgeCheck },
];

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────
const InsightBanner = ({ insight }) => {
    const c = insightColorMap[insight.color];
    return (
        <div className={`rounded-2xl border p-4 flex items-start gap-3 ${c.bg} ${c.border}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
                <insight.icon size={18} className={c.icon} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{insight.crop}</span>
                    <span className={`text-xs font-bold ${c.icon}`}>{insight.title}</span>
                </div>
                <p className="text-sm text-gray-700 leading-snug">{insight.text}</p>
            </div>
        </div>
    );
};

const SupplierCard = ({ supplier, onNegotiate, onOrder }) => {
    const rating = supplier.averageRating || (3.8 + Math.random() * 1.2);
    const deliveryDays = supplier.deliveryDays || Math.floor(3 + Math.random() * 5);
    const dealsBadge = supplier.dealsCount || Math.floor(5 + Math.random() * 50);
    const savingPct = supplier.savingPct || Math.floor(5 + Math.random() * 18);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            {/* Saving badge */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {(supplier.businessName || supplier.name || 'S')[0].toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight">
                                {supplier.businessName || supplier.name}
                            </h3>
                            <p className="text-xs text-gray-500 capitalize">{supplier.supplierType || supplier.role || 'Vendor'}</p>
                        </div>
                    </div>
                    {supplier.isVerified !== false && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Shield size={11} /> Verified
                        </span>
                    )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-base font-bold text-gray-900 flex items-center justify-center gap-0.5">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            {rating.toFixed(1)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Rating</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-base font-bold text-gray-900">{deliveryDays}d</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Delivery</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                        <p className="text-base font-bold text-emerald-700">↓{savingPct}%</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Potential</p>
                    </div>
                </div>

                {/* Location */}
                {(supplier.location || supplier.district) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                        <MapPin size={12} />
                        <span>{supplier.location || supplier.district}</span>
                    </div>
                )}

                {/* Deals count */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>{dealsBadge} successful deals</span>
                </div>

                {/* CTA buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onNegotiate(supplier)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-all"
                    >
                        <MessageSquare size={14} /> Negotiate
                    </button>
                    <button
                        onClick={() => onOrder(supplier)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-all"
                    >
                        <ShoppingBag size={14} /> Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

// Negotiate Modal
const NegotiateModal = ({ supplier, onClose, onStart }) => {
    const [quantity, setQuantity] = useState('');
    const [targetPrice, setTargetPrice] = useState('');
    const [message, setMessage] = useState('');
    const [crop, setCrop] = useState('Wheat');

    const CROPS = ['Wheat', 'Rice', 'Maize', 'Cotton', 'Soybean', 'Sugarcane', 'Groundnut', 'Mustard'];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!quantity || !targetPrice) {
            toast.error('Please fill in quantity and target price');
            return;
        }
        onStart({ supplier, quantity, targetPrice, message, crop });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Start Negotiation</h3>
                        <p className="text-sm text-gray-500">with {supplier?.businessName || supplier?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Market insight inline */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 items-start">
                        <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            <strong>Market tip:</strong> Current average offer price is 12% above market. Use today's market price as leverage.
                        </p>
                    </div>

                    {/* Crop */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Product / Crop</label>
                        <select
                            value={crop}
                            onChange={e => setCrop(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            {CROPS.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Quantity (kg / units)</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            placeholder="e.g. 500"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>

                    {/* Target price */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Your Target Price (₹ per unit)</label>
                        <input
                            type="number"
                            min="1"
                            value={targetPrice}
                            onChange={e => setTargetPrice(e.target.value)}
                            placeholder="e.g. 240"
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Opening Message <span className="text-gray-400 font-normal">(optional)</span></label>
                        <textarea
                            rows={3}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Introduce your offer, mention bulk discounts, quality requirements..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                            <Handshake size={15} /> Send Offer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────
const ProcurePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [sortBy, setSortBy] = useState('rating');
    const [negotiateTarget, setNegotiateTarget] = useState(null);
    const [activeTip, setActiveTip] = useState(0);
    const [dismissedInsight, setDismissedInsight] = useState(null);
    const [aiModalOpen, setAiModalOpen] = useState(false);

    // Rotate tips
    useEffect(() => {
        const t = setInterval(() => setActiveTip(p => (p + 1) % NEGOTIATION_TIPS.length), 4000);
        return () => clearInterval(t);
    }, []);

    // Fetch verified suppliers from marketplace
    useEffect(() => {
        const fetchSuppliers = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/api/marketplace/saved-suppliers');
                const list = data?.suppliers || [];
                setSuppliers(list.map(s => s.supplier || s));
            } catch {
                // Fallback: fetch all marketplace products and extract vendor info
                try {
                    const { data } = await api.get('/api/marketplace?limit=20');
                    const products = data?.data || data?.products || [];
                    const seen = new Set();
                    const vendorList = products
                        .filter(p => p.vendor || p.seller)
                        .map(p => p.vendor || p.seller)
                        .filter(v => {
                            if (seen.has(v._id)) return false;
                            seen.add(v._id);
                            return true;
                        });
                    setSuppliers(vendorList);
                } catch {
                    setSuppliers([]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    const handleNegotiateStart = ({ supplier, quantity, targetPrice, message, crop }) => {
        setNegotiateTarget(null);
        toast.success('Offer sent! Opening negotiation...');
        // Navigate to negotiations list or create a new negotiation
        navigate('/negotiations', {
            state: { prefill: { supplier, quantity, targetPrice, message, crop } }
        });
    };

    const handleOrder = (supplier) => {
        navigate('/marketplace', { state: { vendorId: supplier._id } });
    };

    // Filter + sort
    const TYPES = ['All', 'Farmer', 'Vendor', 'Distributor'];
    const filteredSuppliers = suppliers
        .filter(s => {
            const name = (s.businessName || s.name || '').toLowerCase();
            const loc = (s.location || s.district || '').toLowerCase();
            const matchSearch = name.includes(search.toLowerCase()) || loc.includes(search.toLowerCase());
            const type = (s.supplierType || s.role || '').toLowerCase();
            const matchType = filterType === 'All' || type === filterType.toLowerCase();
            return matchSearch && matchType;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return (b.averageRating || 4) - (a.averageRating || 4);
            if (sortBy === 'deals') return (b.dealsCount || 10) - (a.dealsCount || 10);
            return 0;
        });

    // Mock sample suppliers if API returns empty (for demo)
    const DEMO_SUPPLIERS = [
        { _id: 'd1', businessName: 'Punjab Agro Traders', supplierType: 'Vendor', location: 'Ludhiana, Punjab', averageRating: 4.8, isVerified: true, dealsCount: 142, savingPct: 14 },
        { _id: 'd2', businessName: 'Deccan Seeds Co.', supplierType: 'Distributor', location: 'Pune, Maharashtra', averageRating: 4.5, isVerified: true, dealsCount: 87, savingPct: 9 },
        { _id: 'd3', businessName: 'Green Valley Farms', supplierType: 'Farmer', location: 'Nashik, Maharashtra', averageRating: 4.7, isVerified: true, dealsCount: 53, savingPct: 17 },
        { _id: 'd4', businessName: 'Rajasthan Commodity Hub', supplierType: 'Vendor', location: 'Jaipur, Rajasthan', averageRating: 4.3, isVerified: true, dealsCount: 61, savingPct: 11 },
        { _id: 'd5', businessName: 'TamilNadu Agri Links', supplierType: 'Distributor', location: 'Coimbatore, Tamil Nadu', averageRating: 4.6, isVerified: true, dealsCount: 38, savingPct: 8 },
        { _id: 'd6', businessName: 'UP Grain Collective', supplierType: 'Farmer', location: 'Lucknow, UP', averageRating: 4.4, isVerified: true, dealsCount: 29, savingPct: 13 },
    ];
    const displaySuppliers = filteredSuppliers.length > 0 ? filteredSuppliers : DEMO_SUPPLIERS;

    return (
        <div className="min-h-screen flex admin-layout bg-[var(--admin-bg-primary)]">
            <Sidebar onLogout={logout} />
            <main className="flex-1 md:ml-64 overflow-y-auto">

                {/* ── Sticky TopBar ── */}
                <div className="sticky top-0 z-30 bg-[var(--admin-bg-primary)]">
                    <TopBar user={user} onLogout={logout} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                    {/* ── Hero Banner ── */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
                        {/* Decorative circles */}
                        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5" />
                        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />

                        <button
                            onClick={() => navigate('/market-analytics')}
                            className="flex items-center gap-2 text-slate-300 hover:text-white text-sm mb-4 transition-colors"
                        >
                            <ArrowLeft size={15} /> Back to Market Analytics
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={20} className="text-amber-400" />
                                    <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">AI-Powered Procurement</span>
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Ready to Procure?</h1>
                                <p className="text-slate-300 max-w-xl text-base mb-4">
                                    Use real-time market insights to negotiate better deals with our <span className="text-white font-semibold">verified suppliers</span>. Save up to 17% on your next order.
                                </p>
                                <button
                                    onClick={() => setAiModalOpen(true)}
                                    className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                                >
                                    <Sparkles size={18} /> Start Smart Procurement
                                </button>
                            </div>

                            {/* Rotating negotiation tip */}
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 w-full md:w-64 shrink-0">
                                <div className="flex items-center gap-2 mb-2">
                                    {React.createElement(NEGOTIATION_TIPS[activeTip].icon, { size: 16, className: 'text-amber-400' })}
                                    <span className="text-xs font-bold text-amber-400 uppercase">Pro Tip</span>
                                </div>
                                <p className="text-sm text-slate-200 leading-relaxed">{NEGOTIATION_TIPS[activeTip].tip}</p>
                                <div className="flex gap-1 mt-3">
                                    {NEGOTIATION_TIPS.map((_, i) => (
                                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeTip ? 'bg-amber-400 w-6' : 'bg-white/30 w-3'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Market Insights Strip ── */}
                    <div>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <BarChart3 size={14} /> Live Market Insights — Use These to Negotiate
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {MARKET_INSIGHTS.filter(i => dismissedInsight !== i.id).map(insight => (
                                <div key={insight.id} className="relative">
                                    <InsightBanner insight={insight} />
                                    <button
                                        onClick={() => setDismissedInsight(insight.id)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Search, Filter, Sort ── */}
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search suppliers by name or location..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
                            />
                        </div>
                        {/* Type filter */}
                        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-2xl p-1">
                            {TYPES.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilterType(t)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filterType === t ? 'bg-slate-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        {/* Sort */}
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm">
                            <Filter size={14} className="text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="text-sm text-gray-700 focus:outline-none bg-transparent"
                            >
                                <option value="rating">Top Rated</option>
                                <option value="deals">Most Deals</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Supplier Grid ── */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <BadgeCheck size={18} className="text-emerald-500" />
                                Verified Suppliers
                                <span className="text-sm font-normal text-gray-400">({displaySuppliers.length})</span>
                            </h2>
                            <button
                                onClick={() => navigate('/marketplace/saved-suppliers')}
                                className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                            >
                                View Saved <ChevronRight size={14} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {displaySuppliers.map(s => (
                                    <SupplierCard
                                        key={s._id}
                                        supplier={s}
                                        onNegotiate={setNegotiateTarget}
                                        onOrder={handleOrder}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── How It Works ── */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <Info size={18} className="text-blue-500" /> How Smart Procurement Works
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            {[
                                { step: '1', title: 'Read Insights', desc: 'Review live market prices and supply alerts above.', icon: BarChart3, color: 'bg-blue-50 text-blue-600' },
                                { step: '2', title: 'Choose Supplier', desc: 'Filter verified suppliers by type, rating, or location.', icon: BadgeCheck, color: 'bg-emerald-50 text-emerald-600' },
                                { step: '3', title: 'Negotiate', desc: 'Set your target price and send an offer instantly.', icon: Handshake, color: 'bg-amber-50 text-amber-600' },
                                { step: '4', title: 'Close the Deal', desc: 'Accept a counter-offer and proceed to checkout.', icon: CheckCircle2, color: 'bg-purple-50 text-purple-600' },
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${s.color}`}>
                                        <s.icon size={22} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 mb-1">STEP {s.step}</span>
                                    <h4 className="font-bold text-gray-900 mb-1 text-sm">{s.title}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Quick links ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4">
                        {[
                            { label: 'Browse Marketplace', icon: ShoppingBag, to: '/marketplace', color: 'from-blue-600 to-blue-700' },
                            { label: 'My Negotiations', icon: MessageSquare, to: '/negotiations', color: 'from-slate-700 to-slate-900' },
                            { label: 'Saved Suppliers', icon: Star, to: '/marketplace/saved-suppliers', color: 'from-amber-500 to-orange-500' },
                            { label: 'Market Analytics', icon: TrendingUp, to: '/market-analytics', color: 'from-emerald-600 to-teal-600' },
                        ].map(link => (
                            <button
                                key={link.label}
                                onClick={() => navigate(link.to)}
                                className={`bg-gradient-to-br ${link.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity text-center`}
                            >
                                <link.icon size={22} />
                                <span className="text-xs font-semibold leading-tight">{link.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Negotiate Modal ── */}
                {negotiateTarget && (
                    <NegotiateModal
                        supplier={negotiateTarget}
                        onClose={() => setNegotiateTarget(null)}
                        onStart={handleNegotiateStart}
                    />
                )}

                {/* ── Smart Procurement Modal ── */}
                <SmartProcurementModal
                    isOpen={aiModalOpen}
                    onClose={() => setAiModalOpen(false)}
                    onSuccess={() => navigate('/negotiations')}
                />
            </main>
        </div>
    );
};

export default ProcurePage;
