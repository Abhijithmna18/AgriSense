import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Droplets, Brain, BarChart3, Award, ArrowLeft,
    Play, RefreshCw, TrendingUp, AlertTriangle, CheckCircle2,
    Cpu, Zap, Database, FlaskConical
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// ---- API calls ----
const rlApi = {
    getRecommendation: (farmId, agent = 'ql') =>
        api.get(`/api/rl/recommendation/${farmId}?agent=${agent}`),
    getMetrics: () => api.get('/api/rl/metrics'),
    getComparison: () => api.get('/api/rl/compare'),
    getHistory: (farmId) => api.get(`/api/rl/history/${farmId}`),
};

// ---- Subcomponents ----

const StatCard = ({ icon: Icon, label, value, sub, color = 'indigo' }) => {
    const colorMap = {
        indigo: 'bg-indigo-50 text-indigo-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
    };
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
                    <Icon size={18} />
                </div>
                <span className="text-sm text-gray-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
};

const AgentBadge = ({ name, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
    >
        {name}
    </button>
);

// Action color mapping
const actionColors = {
    0: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', label: '🚫 No Irrigation' },
    1: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: '💧 Irrigate 10mm' },
    2: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', label: '🌊 Irrigate 20mm' },
    3: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', label: '⛲ Irrigate 30mm' },
};

// ---- Main Page ----

const IrrigationRLPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [farms, setFarms] = useState([]);
    const [selectedFarmId, setSelectedFarmId] = useState('');
    const [agent, setAgent] = useState('ql');
    const [recommendation, setRecommendation] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [comparison, setComparison] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [metricsLoading, setMetricsLoading] = useState(true);

    // Fetch farms for selector
    useEffect(() => {
        api.get('/api/farms').then(res => {
            const farmList = res.data?.data || res.data || [];
            setFarms(farmList);
            if (farmList.length > 0) setSelectedFarmId(farmList[0]._id);
        }).catch(console.error);
    }, []);

    // Fetch training metrics & comparison
    useEffect(() => {
        setMetricsLoading(true);
        Promise.allSettled([
            rlApi.getMetrics(),
            rlApi.getComparison(),
        ]).then(([metricsRes, compareRes]) => {
            if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value.data?.data);
            if (compareRes.status === 'fulfilled') setComparison(compareRes.value.data?.data);
        }).finally(() => setMetricsLoading(false));
    }, []);

    // Fetch decision history when farm changes
    useEffect(() => {
        if (selectedFarmId) {
            rlApi.getHistory(selectedFarmId).then(res => {
                setHistory(res.data?.data || []);
            }).catch(() => { });
        }
    }, [selectedFarmId]);

    const handleGetRecommendation = async () => {
        if (!selectedFarmId) return toast.error('Please select a farm first.');
        setLoading(true);
        try {
            const res = await rlApi.getRecommendation(selectedFarmId, agent);
            setRecommendation(res.data);
            toast.success('Recommendation generated!');
        } catch {
            toast.error('Could not get recommendation. Ensure RL service is running.');
        } finally {
            setLoading(false);
        }
    };

    // Prepare reward chart data
    const qlRewards = metrics?.q_learning?.reward_history?.slice(-100).map((r, i) => ({
        ep: i + 1, ql: r,
    })) || [];
    const ppoRewards = metrics?.ppo?.reward_history?.slice(-100) || [];
    const rewardChartData = qlRewards.map((d, i) => ({
        ...d,
        ppo: ppoRewards[i] ?? null,
    }));

    const compRow = comparison?.comparison;

    return (
        <div className="min-h-screen flex admin-layout bg-[var(--admin-bg-primary)]">
            <Sidebar onLogout={logout} />
            <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                <TopBar user={user} onLogout={logout} />

                <div className="max-w-7xl mx-auto space-y-6 mt-6">

                    {/* Header */}
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 text-sm">
                                <ArrowLeft size={16} /> Back
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <FlaskConical size={28} className="text-indigo-600" />
                                RL Irrigation Optimizer
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                Research: Q-Learning vs PPO for irrigation scheduling
                            </p>
                        </div>
                        {/* Agent selector */}
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-gray-500 mr-1">Agent:</span>
                            <AgentBadge name="Q-Learning" active={agent === 'ql'} onClick={() => setAgent('ql')} />
                            <AgentBadge name="PPO" active={agent === 'ppo'} onClick={() => setAgent('ppo')} />
                        </div>
                    </div>

                    {/* Top stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard icon={Brain} label="Active Agent" value={agent === 'ql' ? 'Q-Learning' : 'PPO'} sub="Tabular vs Deep RL" color="indigo" />
                        <StatCard icon={TrendingUp} label="QL Avg Reward" value={metrics?.q_learning?.final_avg_reward?.toFixed(2) ?? '—'} sub="Last 50 episodes" color="green" />
                        <StatCard icon={Cpu} label="PPO Avg Reward" value={metrics?.ppo?.final_avg_reward?.toFixed(2) ?? '—'} sub="Last 50 episodes" color="blue" />
                        <StatCard icon={Database} label="Decisions Logged" value={history.length} sub="This farm" color="orange" />
                    </div>

                    {/* Recommendation Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <h3 className="font-bold text-gray-900">Get Today's Recommendation</h3>

                            {/* Farm selector */}
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">Select Farm</label>
                                <select
                                    value={selectedFarmId}
                                    onChange={e => setSelectedFarmId(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                >
                                    {farms.length === 0 && <option>No farms found</option>}
                                    {farms.map(f => (
                                        <option key={f._id} value={f._id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleGetRecommendation}
                                disabled={loading || !selectedFarmId}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold transition-all disabled:opacity-60"
                            >
                                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
                                {loading ? 'Analyzing...' : 'Get Recommendation'}
                            </button>

                            {/* Recommendation Result */}
                            {recommendation && (() => {
                                const rec = recommendation.recommendation;
                                const colors = actionColors[rec.action] || actionColors[0];
                                return (
                                    <div className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-medium text-gray-500 uppercase">Action</span>
                                            <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-600 font-medium">{rec.agent}</span>
                                        </div>
                                        <p className={`text-xl font-bold mb-1 ${colors.text}`}>{colors.label}</p>
                                        <p className={`text-sm ${colors.text} opacity-80`}>{rec.reasoning}</p>
                                        <div className="flex justify-between mt-3 text-xs text-gray-500">
                                            <span>💧 {rec.irrigation_mm}mm</span>
                                            <span>🎯 Confidence: {Math.round(rec.confidence * 100)}%</span>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* State Vector */}
                            {recommendation?.state && (
                                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                                    <p className="font-medium text-gray-800 mb-1">State Vector</p>
                                    {Object.entries(recommendation.state).map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span className="text-gray-400">{k}</span>
                                            <span className="font-mono">{typeof v === 'number' ? v.toFixed(3) : v}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reward Curve Chart */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <BarChart3 size={18} className="text-indigo-600" /> Training Reward Curves
                            </h3>
                            {metricsLoading ? (
                                <div className="flex items-center justify-center h-56 text-gray-400 text-sm">Loading metrics...</div>
                            ) : rewardChartData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-56 text-gray-400 gap-3">
                                    <AlertTriangle size={32} className="text-amber-400" />
                                    <p className="text-sm font-medium">No training data yet</p>
                                    <p className="text-xs text-gray-400">Run: <code className="bg-gray-100 px-1 rounded">python train.py --episodes 500</code></p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={rewardChartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="ep" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} label={{ value: 'Episode', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="ql" name="Q-Learning" stroke="#6366f1" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="ppo" name="PPO" stroke="#10b981" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Research Comparison Table */}
                    {compRow && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Award size={18} className="text-amber-500" />
                                Research Comparison: Q-Learning vs PPO
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-100">
                                            <th className="py-3 pr-6 font-medium">Metric</th>
                                            <th className="py-3 pr-6 font-medium text-indigo-600">Q-Learning</th>
                                            <th className="py-3 pr-6 font-medium text-emerald-600">PPO</th>
                                            <th className="py-3 font-medium">Winner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: 'Final Avg Reward', key: 'final_avg_reward' },
                                            { label: 'Max Reward', key: 'max_reward' },
                                            { label: 'Convergence Episode', key: 'convergence_episode' },
                                            { label: 'Training Time (s)', key: 'training_time_s' },
                                        ].map(row => (
                                            <tr key={row.key} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-3 pr-6 font-medium text-gray-700">{row.label}</td>
                                                <td className="py-3 pr-6 text-indigo-700 font-mono">
                                                    {compRow[row.key]?.q_learning ?? '—'}
                                                </td>
                                                <td className="py-3 pr-6 text-emerald-700 font-mono">
                                                    {compRow[row.key]?.ppo ?? '—'}
                                                </td>
                                                <td className="py-3">
                                                    {compRow[row.key]?.winner ? (
                                                        <span className="flex items-center gap-1 text-amber-600 font-semibold text-xs">
                                                            <CheckCircle2 size={14} />{compRow[row.key].winner}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Decision History */}
                    {history.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Droplets size={18} className="text-blue-500" /> Recent Decisions (This Farm)
                            </h3>
                            <div className="space-y-2">
                                {history.slice(0, 8).map((h, i) => {
                                    const c = actionColors[h.action] || actionColors[0];
                                    return (
                                        <div key={i} className={`flex items-center justify-between rounded-xl border p-3 ${c.bg} ${c.border}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`font-semibold text-sm ${c.text}`}>{h.actionLabel}</span>
                                                <span className="text-xs text-gray-500">Day {h.dayInSeason}</span>
                                                <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-500">{h.agent}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Confidence: {Math.round((h.confidence || 0) * 100)}%</p>
                                                <p className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Service Status */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                            <Zap size={16} /> Quick Start Guide
                        </h4>
                        <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                            <li>Open terminal in <code className="bg-white px-1 rounded">microservices/rl_irrigation_service/</code></li>
                            <li>Run <code className="bg-white px-1 rounded">pip install -r requirements.txt</code></li>
                            <li>Train agents: <code className="bg-white px-1 rounded">python train.py --episodes 500 --agent both</code></li>
                            <li>Start API: <code className="bg-white px-1 rounded">uvicorn api:app --port 8001</code></li>
                            <li>Select a farm above and click "Get Recommendation"</li>
                        </ol>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default IrrigationRLPage;
