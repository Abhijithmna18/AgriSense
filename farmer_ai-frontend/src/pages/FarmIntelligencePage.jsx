import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Activity, TrendingUp, Bug, Droplets, BarChart2,
    RefreshCw, ChevronRight, AlertTriangle, CheckCircle,
    ArrowRight, Zap, Leaf, ShoppingCart, Loader2
} from 'lucide-react';
import api from '../services/authApi';
import toast from 'react-hot-toast';
import {
    RadialBarChart, RadialBar, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

// ─── Sub-Components ────────────────────────────────────────────

const InsightCard = ({ title, icon: Icon, iconBg, children, loading, onRefresh, badge }) => (
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

const RiskBadge = ({ level }) => {
    const cfg = {
        High: 'bg-red-100 text-red-700 border border-red-200',
        Medium: 'bg-amber-100 text-amber-700 border border-amber-200',
        Low: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    };
    return <span className={`px-3 py-1 rounded-full text-sm font-bold ${cfg[level] || cfg.Low}`}>{level}</span>;
};

const ScoreArc = ({ score, label, color }) => {
    const data = [{ value: score, fill: color }, { value: 100 - score, fill: '#F1F5F9' }];
    return (
        <div className="relative w-44 h-44 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" data={data} startAngle={90} endAngle={-270} barSize={14}>
                    <RadialBar dataKey="value" cornerRadius={6} />
                </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800">{score}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────

const FarmIntelligencePage = () => {
    const navigate = useNavigate();

    const [farms, setFarms] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState(null);
    const [cropType, setCropType] = useState('rice');

    const [insights, setInsights] = useState({
        health: null, yield: null, pest: null, irrigation: null, market: null
    });
    const [loading, setLoading] = useState({
        health: false, yield: false, pest: false, irrigation: false, market: false, farms: true
    });
    const [yieldError, setYieldError] = useState(null); // 'no_cycle' | 'error' | null

    const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));
    const setData = (key, val) => setInsights(p => ({ ...p, [key]: val }));

    // Load farms
    useEffect(() => {
        api.get('/api/farms').then(res => {
            const list = res.data?.data || [];
            setFarms(list);
            if (list.length > 0) {
                setSelectedFarm(list[0]._id);
                setCropType(list[0]?.primaryCrop || 'rice');
            }
        }).catch(() => toast.error('Failed to load farms')).finally(() => setLoad('farms', false));
    }, []);

    const fetchAll = useCallback(async () => {
        if (!selectedFarm) return;
        ['health', 'yield', 'pest', 'irrigation'].forEach(k => setLoad(k, true));
        setLoad('market', true);
        setYieldError(null);

        const tasks = [
            api.get(`/api/insights/farm-health/${selectedFarm}`).then(r => setData('health', r.data.data)).catch(() => { }).finally(() => setLoad('health', false)),
            api.get(`/api/insights/yield-prediction/${selectedFarm}`)
                .then(r => { setData('yield', r.data.data); setYieldError(null); })
                .catch(err => {
                    const status = err?.response?.status;
                    setYieldError(status === 404 ? 'no_cycle' : 'error');
                }).finally(() => setLoad('yield', false)),
            api.get(`/api/insights/pest-risk/${selectedFarm}`).then(r => setData('pest', r.data.data)).catch(() => { }).finally(() => setLoad('pest', false)),
            api.get(`/api/insights/irrigation-advice/${selectedFarm}`).then(r => setData('irrigation', r.data.data)).catch(() => { }).finally(() => setLoad('irrigation', false)),
            api.get(`/api/insights/market-price/${cropType}?weeksAway=4`).then(r => setData('market', r.data.data)).catch(() => { }).finally(() => setLoad('market', false)),
        ];
        await Promise.allSettled(tasks);
        toast.success('Intelligence refreshed');
    }, [selectedFarm, cropType]);

    useEffect(() => {
        if (selectedFarm) fetchAll();
    }, [selectedFarm]);

    const fetchSingle = (key) => {
        if (!selectedFarm) return;
        setLoad(key, true);
        let url = '';
        if (key === 'health') url = `/api/insights/farm-health/${selectedFarm}`;
        if (key === 'yield') url = `/api/insights/yield-prediction/${selectedFarm}`;
        if (key === 'pest') url = `/api/insights/pest-risk/${selectedFarm}`;
        if (key === 'irrigation') url = `/api/insights/irrigation-advice/${selectedFarm}`;
        if (key === 'market') url = `/api/insights/market-price/${cropType}?weeksAway=4`;
        api.get(url).then(r => setData(key, r.data.data)).catch(() => toast.error(`Failed to refresh ${key}`)).finally(() => setLoad(key, false));
    };

    const healthColor = (score) => score >= 75 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';
    const h = insights.health;
    const y = insights.yield;
    const p = insights.pest;
    const irr = insights.irrigation;
    const mkt = insights.market;

    // Build market sparkline
    const sparkData = mkt?.priceHistory?.map((v, i) => ({ week: `W${i + 1}`, price: v })) || [];

    if (loading.farms) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Brain className="mx-auto mb-4 text-green-600 animate-pulse" size={48} />
                    <p className="text-slate-600 font-medium">Initializing Farm Intelligence Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-green-700 font-medium mb-2 transition-colors group">
                            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
                            Back to Dashboard
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                                <Brain className="text-white" size={26} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">Farm Intelligence Engine</h1>
                                <p className="text-slate-500 text-sm">AI-powered insights from your farm's real-time data</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Farm Selector */}
                        <select
                            value={selectedFarm || ''}
                            onChange={e => setSelectedFarm(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            {farms.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                            {farms.length === 0 && <option>No farms found</option>}
                        </select>

                        {/* Crop Selector (for market intel) */}
                        <select
                            value={cropType}
                            onChange={e => setCropType(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            {['rice', 'wheat', 'pepper', 'tomato', 'maize', 'coconut', 'banana', 'potato'].map(c => (
                                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                        </select>

                        <button
                            onClick={fetchAll}
                            disabled={Object.values(loading).some(v => v)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-green-200 transition-all disabled:opacity-60"
                        >
                            <Zap size={16} />
                            Refresh Intelligence
                        </button>
                    </div>
                </div>

                {/* ── Row 1: Health Score + Yield ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Farm Health Score */}
                    <InsightCard
                        title="Farm Health Score"
                        icon={Activity}
                        iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
                        loading={loading.health}
                        onRefresh={() => fetchSingle('health')}
                        badge={h ? { text: h.label, cls: h.health_score >= 75 ? 'bg-green-100 text-green-700' : h.health_score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700' } : null}
                    >
                        {h ? (
                            <div className="space-y-5">
                                <ScoreArc score={h.health_score} label="/ 100" color={healthColor(h.health_score)} />
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Water Stress', val: h.diagnosis.water_stress, high: 'High' },
                                        { label: 'Nutrient Risk', val: h.diagnosis.nutrient_deficiency_risk, high: 'High' },
                                        { label: 'Pest Risk', val: h.diagnosis.pest_risk, high: 'High' },
                                    ].map(({ label, val, high }) => (
                                        <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-slate-500 mb-1 font-medium">{label}</p>
                                            <span className={`text-sm font-bold ${val === high ? 'text-red-600' : val === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>{val}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-1.5">
                                    {h.recommendations.map((rec, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                                            {rec}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Activity size={40} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Click refresh to generate health score</p>
                            </div>
                        )}
                    </InsightCard>

                    {/* Yield Prediction */}
                    <InsightCard
                        title="Yield Prediction"
                        icon={TrendingUp}
                        iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                        loading={loading.yield}
                        onRefresh={() => fetchSingle('yield')}
                        badge={y ? { text: `${Math.round(y.confidence_score * 100)}% Confidence`, cls: 'bg-blue-100 text-blue-700' } : null}
                    >
                        {y ? (
                            <div className="space-y-5">
                                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">{y.cropCycle?.toUpperCase() || 'CROP'} • Predicted harvest</p>
                                    <h2 className="text-4xl font-black text-blue-700">{y.predicted_yield_kg?.toLocaleString()} <span className="text-xl font-bold">kg</span></h2>
                                    <p className="text-sm text-blue-500 mt-1">{y.yield_per_acre_kg?.toLocaleString()} kg/acre</p>
                                </div>
                                {/* Progress bar vs baseline */}
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>vs Baseline ({y.baseline_yield_kg?.toLocaleString()} kg)</span>
                                        <span className={y.below_average ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                                            {y.below_average ? '↓ Below Average' : '↑ On Target'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${y.below_average ? 'bg-amber-400' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(100, (y.predicted_yield_kg / y.baseline_yield_kg) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(y.factors || {}).map(([k, v]) => (
                                        <div key={k} className="bg-slate-50 rounded-xl p-3">
                                            <p className="text-xs text-slate-400 mb-1 capitalize">{k.replace('_factor', '').replace('_', ' ')}</p>
                                            <p className={`text-sm font-bold ${v >= 1 ? 'text-green-600' : 'text-red-500'}`}>{(v * 100).toFixed(1)}%</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                                    <Leaf size={16} className="shrink-0 mt-0.5 text-blue-500" />
                                    {y.recommendation}
                                </div>
                            </div>
                        ) : yieldError === 'no_cycle' ? (
                            <div className="text-center py-8">
                                <TrendingUp size={40} className="mx-auto mb-3 text-blue-300" />
                                <p className="text-sm font-bold text-slate-600 mb-1">No Active Crop Cycle</p>
                                <p className="text-xs text-slate-400 mb-4">Create a crop cycle in Field Operations to enable yield predictions.</p>
                                <button
                                    onClick={() => navigate('/field-operations')}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2"
                                >
                                    Go to Field Operations →
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <TrendingUp size={40} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Click refresh to generate yield prediction</p>
                            </div>
                        )}
                    </InsightCard>
                </div>

                {/* ── Row 2: Pest Risk + Irrigation ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Pest Risk */}
                    <InsightCard
                        title="Pest Risk Monitor"
                        icon={Bug}
                        iconBg="bg-gradient-to-br from-red-500 to-rose-600"
                        loading={loading.pest}
                        onRefresh={() => fetchSingle('pest')}
                    >
                        {p ? (
                            <div className="space-y-4">
                                <div className={`rounded-2xl p-5 text-center ${p.risk_level === 'High' ? 'bg-red-50' : p.risk_level === 'Medium' ? 'bg-amber-50' : 'bg-green-50'}`}>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Risk Level</p>
                                    <RiskBadge level={p.risk_level} />
                                    <p className="text-lg font-bold text-slate-800 mt-3">{p.pest}</p>
                                    <p className="text-xs text-slate-500 mt-1">{p.crop} crop at {p.crop}</p>
                                </div>
                                {p.trigger_conditions?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trigger Conditions</p>
                                        <div className="space-y-1.5">
                                            {p.trigger_conditions.map((tc, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                                                    {tc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommendation</p>
                                    <p className="text-sm text-slate-700">{p.recommendation}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs font-bold text-slate-400">Spray Window:</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.risk_level === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{p.spray_window}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Bug size={40} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Click refresh to analyze pest risk</p>
                            </div>
                        )}
                    </InsightCard>

                    {/* Irrigation Advice */}
                    <InsightCard
                        title="Smart Irrigation Advisor"
                        icon={Droplets}
                        iconBg="bg-gradient-to-br from-cyan-500 to-blue-600"
                        loading={loading.irrigation}
                        onRefresh={() => fetchSingle('irrigation')}
                        badge={irr ? {
                            text: irr.irrigation_needed ? 'Action Needed' : 'No Action',
                            cls: irr.irrigation_needed ? 'bg-cyan-100 text-cyan-700' : 'bg-green-100 text-green-700'
                        } : null}
                    >
                        {irr ? (
                            <div className="space-y-4">
                                <div className={`rounded-2xl p-5 ${irr.irrigation_needed ? (irr.severity === 'Critical' ? 'bg-red-50' : 'bg-cyan-50') : 'bg-green-50'}`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        {irr.irrigation_needed
                                            ? <AlertTriangle className={irr.severity === 'Critical' ? 'text-red-500' : 'text-cyan-500'} size={24} />
                                            : <CheckCircle className="text-green-500" size={24} />
                                        }
                                        <div>
                                            <p className="font-bold text-slate-800 text-base">
                                                {irr.irrigation_needed ? `Irrigate for ${irr.recommended_duration_minutes} minutes` : 'No Irrigation Needed'}
                                            </p>
                                            {irr.irrigation_needed && (
                                                <p className="text-sm text-slate-600">Suggested time: <strong>{irr.suggested_time}</strong></p>
                                            )}
                                        </div>
                                    </div>
                                    {irr.irrigation_needed && (
                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            <div className="bg-white/70 rounded-xl p-3 text-center">
                                                <p className="text-xs text-slate-400">Duration</p>
                                                <p className="text-xl font-black text-cyan-700">{irr.recommended_duration_minutes}<span className="text-sm"> min</span></p>
                                            </div>
                                            <div className="bg-white/70 rounded-xl p-3 text-center">
                                                <p className="text-xs text-slate-400">Next Check</p>
                                                <p className="text-xl font-black text-cyan-700">{irr.next_check_hours}<span className="text-sm"> hrs</span></p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Reasoning</p>
                                    <div className="space-y-1.5">
                                        {irr.reasoning?.map((r, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <ChevronRight size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                                                {r}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {irr.pump_command === 'ACTIVATE' && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-red-800 text-sm">Critical — Pump Activation Required</p>
                                            <p className="text-xs text-red-600">Soil moisture is critically low</p>
                                        </div>
                                        <button className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                            Activate Pump
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400">
                                <Droplets size={40} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Click refresh to get irrigation advice</p>
                            </div>
                        )}
                    </InsightCard>
                </div>

                {/* ── Row 3: Market Price Intelligence ── */}
                <InsightCard
                    title="Market Price Intelligence"
                    icon={ShoppingCart}
                    iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
                    loading={loading.market}
                    onRefresh={() => fetchSingle('market')}
                    badge={mkt ? {
                        text: mkt.action === 'HOLD' ? '📈 Hold Recommended' : '💰 Sell Now',
                        cls: mkt.action === 'HOLD' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'
                    } : null}
                >
                    {mkt ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs text-slate-500 font-medium mb-1">Current Price</p>
                                        <p className="text-2xl font-black text-slate-800">₹{mkt.current_price_per_kg}<span className="text-sm font-medium text-slate-500">/kg</span></p>
                                    </div>
                                    <div className={`rounded-xl p-4 ${mkt.price_change_pct > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Projected Price</p>
                                        <p className="text-2xl font-black text-slate-800">₹{mkt.projected_price_per_kg}<span className="text-sm font-medium text-slate-500">/kg</span></p>
                                        <p className={`text-sm font-bold ${mkt.price_change_pct > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {mkt.price_change_pct > 0 ? '↑' : '↓'} {Math.abs(mkt.price_change_pct)}%
                                        </p>
                                    </div>
                                </div>
                                <div className={`rounded-2xl p-5 border-2 ${mkt.action === 'HOLD' ? 'bg-violet-50 border-violet-200' : 'bg-amber-50 border-amber-200'}`}>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">AI Recommendation</p>
                                    <p className={`text-lg font-black mb-2 ${mkt.action === 'HOLD' ? 'text-violet-700' : 'text-amber-700'}`}>
                                        {mkt.action === 'HOLD' ? '📦 Store & Wait' : '🏪 Sell Now'}
                                    </p>
                                    <p className="text-sm text-slate-700">{mkt.reason}</p>
                                    <div className="flex gap-3 mt-3">
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <span className="font-bold">Trend:</span>
                                            <span className={`font-bold ${mkt.trend === 'Upward' ? 'text-green-600' : mkt.trend === 'Downward' ? 'text-red-600' : 'text-slate-600'}`}>{mkt.trend}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <span className="font-bold">Seasonality:</span>
                                            <span className="font-bold">{(mkt.seasonality_factor * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Sparkline */}
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Historical Price Trend</p>
                                {sparkData.length > 1 ? (
                                    <ResponsiveContainer width="100%" height={160}>
                                        <LineChart data={sparkData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip formatter={v => [`₹${v}/kg`, 'Price']} />
                                            <Line type="monotone" dataKey="price" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: '#8B5CF6' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                                        Insufficient price history
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <BarChart2 size={40} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Click refresh to get market price intelligence</p>
                        </div>
                    )}
                </InsightCard>

            </div>
        </div>
    );
};

export default FarmIntelligencePage;
