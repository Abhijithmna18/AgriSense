import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Package, TrendingUp, DollarSign, Star, MessageSquare,
    RefreshCw, AlertTriangle, CheckCircle, ArrowRight, Zap,
    Loader2, ChevronRight, BarChart3, ShoppingBag
} from 'lucide-react';
import api from '../../services/authApi';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

// ── Sub-Components ──────────────────────────────────────────────

const IntelCard = ({ title, icon: Icon, iconBg, children, loading, onRefresh, badge }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                    <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">{title}</h3>
                {badge && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${badge.cls}`}>{badge.text}</span>}
            </div>
            {onRefresh && (
                <button onClick={onRefresh} disabled={loading} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <RefreshCw size={16} className={loading ? 'animate-spin text-slate-400' : 'text-slate-400 hover:text-slate-600'} />
                </button>
            )}
        </div>
        <div className="p-5 flex-1">
            {loading
                ? <div className="flex items-center justify-center h-32"><Loader2 className="animate-spin text-green-500" size={32} /></div>
                : children
            }
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const cfg = {
        Critical: 'bg-red-100 text-red-700 border border-red-200',
        Low: 'bg-amber-100 text-amber-700 border border-amber-200',
        Moderate: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        Sufficient: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg[status] || cfg.Sufficient}`}>{status}</span>;
};

const ScoreGauge = ({ score, max = 5 }) => {
    const pct = (score / max) * 100;
    const color = pct >= 80 ? '#22C55E' : pct >= 60 ? '#F59E0B' : '#EF4444';
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                    <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke={color} strokeWidth="12"
                        strokeDasharray={`${pct * 2.513} ${251.3 - pct * 2.513}`}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">{score}</span>
                    <span className="text-xs text-slate-400 font-medium">/{max}</span>
                </div>
            </div>
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────

const TABS = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'demand', label: 'Demand Forecast', icon: TrendingUp },
    { id: 'profit', label: 'Profit Analytics', icon: DollarSign },
    { id: 'negotiate', label: 'Negotiation AI', icon: MessageSquare },
    { id: 'score', label: 'Vendor Score', icon: Star },
];

const DEMAND_PRODUCTS = ['onion', 'rice', 'wheat', 'tomato', 'potato', 'mango', 'coconut'];

const VendorIntelligencePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('inventory');

    // Data states
    const [inventory, setInventory] = useState([]);
    const [demand, setDemand] = useState(null);
    const [demandProduct, setDemandProduct] = useState('rice');
    const [profit, setProfit] = useState(null);
    const [vendorScore, setVendorScore] = useState(null);

    // Negotiation state
    const [listings, setListings] = useState([]);
    const [negoProductId, setNegoProductId] = useState('');
    const [buyerOffer, setBuyerOffer] = useState('');
    const [negoResult, setNegoResult] = useState(null);

    // Loading states
    const [loading, setLoading] = useState({
        inventory: false, demand: false, profit: false, score: false, nego: false, listings: true
    });
    const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));

    // Load listings for negotiation
    useEffect(() => {
        api.get('/api/marketplace/my-listings')
            .then(res => {
                const list = res.data || [];
                setListings(list);
                if (list.length > 0) setNegoProductId(list[0]._id);
            })
            .catch(() => { })
            .finally(() => setLoad('listings', false));
    }, []);

    // Auto-load tab data on mount
    useEffect(() => { fetchInventory(); fetchProfit(); fetchVendorScore(); }, []);

    const fetchInventory = async () => {
        setLoad('inventory', true);
        try {
            const res = await api.get('/api/vendor-intelligence/inventory');
            setInventory(res.data.data || []);
        } catch { toast.error('Failed to load inventory insights'); }
        finally { setLoad('inventory', false); }
    };

    const fetchDemand = async () => {
        setLoad('demand', true);
        try {
            const res = await api.get(`/api/vendor-intelligence/demand/${demandProduct}`);
            setDemand(res.data.data);
        } catch { toast.error('Failed to load demand forecast'); }
        finally { setLoad('demand', false); }
    };

    const fetchProfit = async () => {
        setLoad('profit', true);
        try {
            const res = await api.get('/api/vendor-intelligence/profit-analysis');
            setProfit(res.data.data);
        } catch { toast.error('Failed to load profit analysis'); }
        finally { setLoad('profit', false); }
    };

    const fetchVendorScore = async () => {
        setLoad('score', true);
        try {
            const res = await api.get('/api/vendor-intelligence/performance-score');
            setVendorScore(res.data.data);
        } catch { toast.error('Failed to load vendor score'); }
        finally { setLoad('score', false); }
    };

    const handleNegotiate = async () => {
        if (!negoProductId || !buyerOffer) {
            toast.error('Select a product and enter the buyer offer price.');
            return;
        }
        setLoad('nego', true);
        setNegoResult(null);
        try {
            const res = await api.post('/api/vendor-intelligence/negotiate', {
                productId: negoProductId,
                buyerOfferPrice: parseFloat(buyerOffer)
            });
            setNegoResult(res.data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Negotiation analysis failed');
        } finally { setLoad('nego', false); }
    };

    // Strategy color config
    const strategyConfig = {
        ACCEPT: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle, color: 'text-emerald-600' },
        COUNTER_CLOSE: { cls: 'bg-blue-100 text-blue-800 border-blue-200', icon: ChevronRight, color: 'text-blue-600' },
        COUNTER_FIRM: { cls: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle, color: 'text-amber-600' },
        DECLINE: { cls: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, color: 'text-red-600' },
    };

    const PIE_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-green-50/10 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button onClick={() => navigate('/vendor/dashboard')}
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-green-700 font-medium mb-2 transition-colors group">
                            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
                            Back to VendorHub
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                <Brain className="text-white" size={26} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">Commerce Intelligence</h1>
                                <p className="text-slate-500 text-sm">AI-powered insights to sell smarter</p>
                            </div>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200">
                        <Zap size={16} /> AI Powered
                    </span>
                </div>

                {/* ── Tab Nav ── */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${activeTab === t.id
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            <t.icon size={16} />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════════
                    TAB 1: INVENTORY INTELLIGENCE
                   ══════════════════════════════════════════════════ */}
                {activeTab === 'inventory' && (
                    <IntelCard
                        title="Inventory Stockout Intelligence"
                        icon={Package}
                        iconBg="bg-gradient-to-br from-orange-500 to-amber-600"
                        loading={loading.inventory}
                        onRefresh={fetchInventory}
                    >
                        {inventory.length > 0 ? (
                            <div className="space-y-4">
                                {inventory.map((item, i) => (
                                    <div key={i} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-bold text-slate-800">{item.product}</p>
                                                <p className="text-xs text-slate-400">{item.current_stock} {item.unit} in stock · {item.avg_daily_sales} {item.unit}/day avg</p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 mb-3">
                                            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                                                <p className="text-xs text-slate-400">Days Left</p>
                                                <p className="text-xl font-black text-slate-800">
                                                    {item.days_until_stockout >= 999 ? '∞' : item.days_until_stockout}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                                                <p className="text-xs text-slate-400">Revenue at Risk</p>
                                                <p className="text-sm font-bold text-red-600">₹{item.weekly_revenue_at_risk?.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                                                <p className="text-xs text-slate-400">Action</p>
                                                <p className="text-xs font-bold text-amber-700">{item.urgency}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                                            <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
                                            {item.recommendation}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                <Package size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium text-slate-500">No active listings found</p>
                                <button onClick={() => navigate('/vendor/dashboard')}
                                    className="mt-3 text-sm font-bold text-emerald-600 hover:underline">
                                    Add products in VendorHub →
                                </button>
                            </div>
                        )}
                    </IntelCard>
                )}

                {/* ══════════════════════════════════════════════════
                    TAB 2: DEMAND FORECAST
                   ══════════════════════════════════════════════════ */}
                {activeTab === 'demand' && (
                    <IntelCard
                        title="7-Day Demand Forecast"
                        icon={TrendingUp}
                        iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                        loading={loading.demand}
                        onRefresh={fetchDemand}
                        badge={demand ? {
                            text: `${demand.trend} ${demand.pct_change_vs_current > 0 ? '↑' : demand.pct_change_vs_current < 0 ? '↓' : '→'} ${Math.abs(demand.pct_change_vs_current)}%`,
                            cls: demand.trend === 'Upward' ? 'bg-green-100 text-green-700' : demand.trend === 'Downward' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        } : null}
                    >
                        <div className="space-y-5">
                            <div className="flex gap-3 flex-wrap">
                                <select
                                    value={demandProduct}
                                    onChange={e => setDemandProduct(e.target.value)}
                                    className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    {DEMAND_PRODUCTS.map(p => (
                                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={fetchDemand}
                                    disabled={loading.demand}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
                                >
                                    <Zap size={14} /> Forecast
                                </button>
                            </div>

                            {demand ? (
                                <>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                                            <p className="text-xs text-blue-400 font-medium">7-Day Total</p>
                                            <p className="text-2xl font-black text-blue-700">{demand.total_predicted_units}</p>
                                            <p className="text-xs text-blue-400">units</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                                            <p className="text-xs text-slate-400 font-medium">Avg / Day</p>
                                            <p className="text-2xl font-black text-slate-700">{demand.avg_daily_demand}</p>
                                            <p className="text-xs text-slate-400">units</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                                            <p className="text-xs text-slate-400 font-medium">Seasonality</p>
                                            <p className="text-2xl font-black text-slate-700">{(demand.seasonal_factor * 100).toFixed(0)}%</p>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={demand.forecast_7_days}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip formatter={v => [`${v} units`, 'Predicted']} />
                                            <Bar dataKey="predicted_sales" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                                        <ChevronRight size={14} className="shrink-0 mt-0.5 text-blue-400" />
                                        {demand.recommendation}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-slate-400">
                                    <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Select a product and click Forecast</p>
                                </div>
                            )}
                        </div>
                    </IntelCard>
                )}

                {/* ══════════════════════════════════════════════════
                    TAB 3: PROFIT ANALYTICS
                   ══════════════════════════════════════════════════ */}
                {activeTab === 'profit' && (
                    <IntelCard
                        title="Profit Analytics"
                        icon={DollarSign}
                        iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
                        loading={loading.profit}
                        onRefresh={fetchProfit}
                    >
                        {profit ? (
                            <div className="space-y-5">
                                {/* Summary KPIs */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center border border-emerald-100">
                                        <p className="text-xs text-emerald-500 font-medium mb-1">Total Revenue</p>
                                        <p className="text-2xl font-black text-emerald-700">₹{profit.summary?.totalRevenue?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                        <p className="text-xs text-slate-400 font-medium mb-1">Net Profit (Est.)</p>
                                        <p className="text-2xl font-black text-slate-700">₹{profit.summary?.totalEstimatedProfit?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                                        <p className="text-xs text-blue-400 font-medium mb-1">Avg Margin</p>
                                        <p className="text-2xl font-black text-blue-700">{profit.summary?.overallMarginPct || 0}%</p>
                                    </div>
                                </div>

                                {/* Product Table */}
                                {profit.products?.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                                    <th className="px-4 py-3 text-left rounded-l-xl font-semibold">Product</th>
                                                    <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                                                    <th className="px-4 py-3 text-right font-semibold">Est. Cost</th>
                                                    <th className="px-4 py-3 text-right font-semibold">Profit</th>
                                                    <th className="px-4 py-3 text-right rounded-r-xl font-semibold">Margin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {profit.products.map((p, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <p className="font-semibold text-slate-800">{p.productName}</p>
                                                            <p className="text-xs text-slate-400">{p.orderCount} orders · {p.totalQuantitySold} units</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-slate-700">₹{p.totalRevenue?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right text-red-500">₹{p.estimatedCost?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{p.estimatedProfit?.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                                {p.profitMarginPct}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400">
                                        <BarChart3 size={36} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No completed orders yet. Profit data will appear here after first deliveries.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                <DollarSign size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Click refresh to load profit analysis</p>
                            </div>
                        )}
                    </IntelCard>
                )}

                {/* ══════════════════════════════════════════════════
                    TAB 4: NEGOTIATION AI
                   ══════════════════════════════════════════════════ */}
                {activeTab === 'negotiate' && (
                    <IntelCard
                        title="AI Negotiation Assistant"
                        icon={MessageSquare}
                        iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
                        loading={false}
                    >
                        <div className="space-y-5">
                            <p className="text-sm text-slate-500">Enter the buyer's offer and get an AI-powered counter-offer strategy instantly.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Your Product</label>
                                    <select
                                        value={negoProductId}
                                        onChange={e => setNegoProductId(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-violet-500 outline-none"
                                    >
                                        {loading.listings
                                            ? <option>Loading listings...</option>
                                            : listings.length === 0
                                                ? <option>No products found</option>
                                                : listings.map(l => (
                                                    <option key={l._id} value={l._id}>
                                                        {l.name || l.productRef} — ₹{l.pricePerUnit}/{l.unit}
                                                    </option>
                                                ))
                                        }
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Buyer's Offer Price (₹/unit)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 45"
                                        value={buyerOffer}
                                        onChange={e => setBuyerOffer(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleNegotiate}
                                disabled={loading.nego}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-violet-200 transition-all disabled:opacity-60"
                            >
                                {loading.nego ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
                                Get AI Negotiation Strategy
                            </button>

                            {negoResult && (() => {
                                const cfg = strategyConfig[negoResult.strategy] || strategyConfig.COUNTER_FIRM;
                                const StratIcon = cfg.icon;
                                return (
                                    <div className={`rounded-2xl p-5 border-2 ${cfg.cls} space-y-4`}>
                                        <div className="flex items-center gap-3">
                                            <StratIcon size={24} className={cfg.color} />
                                            <div>
                                                <p className="font-black text-lg text-slate-800">
                                                    {negoResult.strategy === 'ACCEPT' ? '✅ Accept the Offer'
                                                        : negoResult.strategy === 'COUNTER_CLOSE' ? '🤝 Counter Close'
                                                            : negoResult.strategy === 'COUNTER_FIRM' ? '💪 Counter Firmly'
                                                                : '❌ Decline the Offer'}
                                                </p>
                                                <p className="text-xs text-slate-500">Gap: {negoResult.gap_pct}% below your list price</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-white/70 rounded-xl p-3 text-center">
                                                <p className="text-xs text-slate-400">Your Price</p>
                                                <p className="text-xl font-black text-slate-700">₹{negoResult.your_price}</p>
                                            </div>
                                            <div className="bg-white/70 rounded-xl p-3 text-center">
                                                <p className="text-xs text-slate-400">Buyer Offer</p>
                                                <p className="text-xl font-black text-red-600">₹{negoResult.buyer_offer}</p>
                                            </div>
                                            <div className="bg-white/70 rounded-xl p-3 text-center">
                                                <p className="text-xs text-slate-400">AI Counter</p>
                                                <p className="text-xl font-black text-emerald-600">₹{negoResult.suggested_counter_offer}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-700 bg-white/60 rounded-xl p-3">
                                            <span className="font-bold">AI Advice: </span>{negoResult.advice}
                                        </div>
                                        <p className="text-xs text-slate-500">Market avg: ₹{negoResult.market_price} · Max safe discount: {negoResult.max_safe_discount_pct}%</p>
                                    </div>
                                );
                            })()}
                        </div>
                    </IntelCard>
                )}

                {/* ══════════════════════════════════════════════════
                    TAB 5: VENDOR SCORE
                   ══════════════════════════════════════════════════ */}
                {activeTab === 'score' && (
                    <IntelCard
                        title="Vendor Performance Score"
                        icon={Star}
                        iconBg="bg-gradient-to-br from-yellow-400 to-orange-500"
                        loading={loading.score}
                        onRefresh={fetchVendorScore}
                        badge={vendorScore ? { text: `${vendorScore.tier_badge} ${vendorScore.tier}`, cls: 'bg-yellow-100 text-yellow-800' } : null}
                    >
                        {vendorScore ? (
                            <div className="space-y-6">
                                <div className="flex flex-col items-center">
                                    <ScoreGauge score={vendorScore.vendor_score} max={5} />
                                    <p className="text-2xl font-black text-slate-800 mt-2">{vendorScore.tier_badge} {vendorScore.tier} Vendor</p>
                                    <p className="text-sm text-slate-400">{vendorScore.vendor_score} out of 5.0</p>
                                </div>

                                {/* Breakdown */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Rating Score', val: vendorScore.breakdown?.rating_score, icon: Star },
                                        { label: 'Delivery Score', val: vendorScore.breakdown?.delivery_score, icon: ShoppingBag },
                                        { label: 'Response Score', val: vendorScore.breakdown?.response_score, icon: MessageSquare }
                                    ].map(({ label, val, icon: Icon }) => (
                                        <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                                            <Icon size={16} className="mx-auto text-slate-400 mb-1" />
                                            <p className="text-xs text-slate-400">{label}</p>
                                            <p className="text-xl font-black text-slate-700">{val?.toFixed(1)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Metrics */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-xs text-slate-400 mb-1">Completion Rate</p>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                                            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${vendorScore.metrics?.completion_rate_pct || 0}%` }} />
                                        </div>
                                        <p className="text-sm font-bold text-emerald-600">{vendorScore.metrics?.completion_rate_pct}%</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-xs text-slate-400 mb-1">Avg Response Time</p>
                                        <p className="text-xl font-black text-slate-700">{vendorScore.metrics?.avg_response_hours}h</p>
                                        <p className="text-xs text-slate-400">to respond to buyers</p>
                                    </div>
                                </div>

                                {/* Improvements */}
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Recommendations</p>
                                    {vendorScore.improvements?.map((imp, i) => (
                                        <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-xl p-3 text-sm text-amber-800">
                                            <CheckCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
                                            {imp}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                <Star size={40} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Click refresh to compute your vendor score</p>
                            </div>
                        )}
                    </IntelCard>
                )}

            </div>
        </div>
    );
};

export default VendorIntelligencePage;
