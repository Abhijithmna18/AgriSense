import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import {
    Calendar, Download, Filter, TrendingUp, TrendingDown,
    AlertCircle, MapPin, Search, ArrowRight, Zap, Info
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import TopBar from '../components/dashboard/TopBar';
import { useAuth } from '../context/AuthContext';
import api from '../services/authApi';

const MarketAnalyticsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('30d');
    const [activeRegion, setActiveRegion] = useState('Regional');
    const [activeProduct, setActiveProduct] = useState('Wheat');
    const [loading, setLoading] = useState(true);
    const [priceData, setPriceData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [stats, setStats] = useState({ avgPrice: 0, activeSuppliers: 0, demandIndex: 0, volatility: 'Low' });
    const [topMovers, setTopMovers] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/marketplace/analytics?timeRange=${timeRange}`);
            if (data.success) {
                setPriceData(data.trends);
                setHeatmapData(data.heatmap);
                setStats(data.stats);
                setTopMovers(data.topMovers);
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        } finally {
            setLoading(false);
        }
    };

    const historicalData = [
        { name: 'Last Year', value: stats.avgPrice * 0.9 },
        { name: 'Last Season', value: stats.avgPrice * 0.95 },
        { name: 'Current', value: stats.avgPrice },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200'; // High Demand / Low Supply
            case 'med': return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Balanced
            case 'low': return 'bg-green-100 text-green-700 border-green-200'; // Overstocked
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen flex admin-layout">
            <Sidebar onLogout={handleLogout} />

            <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative bg-[var(--admin-bg-primary)]">
                <TopBar user={user} onLogout={handleLogout} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8">

                        {/* 1. Header & Filters */}
                        <div className="sticky top-0 z-20 bg-[var(--admin-bg-primary)] pb-4">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Market Analytics</h1>
                                    <p className="text-sm text-gray-500">Real-time insights for smarter procurement</p>
                                </div>
                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="text" placeholder="Search Product..." className="pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
                                    </div>
                                    <select className="px-4 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none cursor-pointer">
                                        <option>North India</option>
                                        <option>West India</option>
                                        <option>South India</option>
                                    </select>
                                    <div className="bg-white rounded-lg border border-slate-300 flex overflow-hidden">
                                        {['7d', '30d', '90d'].map(range => (
                                            <button
                                                key={range}
                                                onClick={() => setTimeRange(range)}
                                                className={`px-3 py-2 text-sm font-medium transition-colors ${timeRange === range ? 'bg-blue-600 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                                            >
                                                {range}
                                            </button>
                                        ))}
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                        <Download size={16} /> Export
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Key Market Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Avg Market Price', value: `₹${stats.avgPrice}/unit`, change: '+5.2%', trend: 'up', sub: 'vs last week' },
                                { label: 'Price Volatility', value: stats.volatility, change: '8.4', trend: 'up', sub: 'Index Score', color: 'text-red-600' },
                                { label: 'Demand Index', value: stats.demandIndex > 10 ? 'Very High' : 'Moderate', change: `+${stats.demandIndex}%`, trend: 'up', sub: 'Supply Shortage', color: 'text-amber-600' },
                                { label: 'Active Suppliers', value: stats.activeSuppliers, change: '-2', trend: 'down', sub: 'Regionally' }
                            ].map((card, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium text-gray-500">{card.label}</span>
                                        {card.trend === 'up' ? <TrendingUp size={16} className="text-red-500" /> : <TrendingDown size={16} className="text-green-500" />}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-bold ${card.color || 'text-gray-800'}`}>{card.value}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <span className={card.trend === 'up' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{card.change}</span>
                                            {card.sub}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. Price Trends */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">Price Trend Analysis</h3>
                                        <p className="text-sm text-gray-500">Wheat prices over the last 30 days</p>
                                    </div>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        {['Local', 'Regional', 'National'].map(region => (
                                            <button
                                                key={region}
                                                onClick={() => setActiveRegion(region)}
                                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeRegion === region ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                {region}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={priceData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ fontSize: '12px' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Line type="monotone" dataKey="price" name="Current Price" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="avg" name="Seasonal Avg" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
                                    <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm text-blue-800">
                                        <strong>Insight:</strong> Prices are trending upward due to reduced supply in the North region. Expect +5% increase next week.
                                    </p>
                                </div>
                            </div>

                            {/* 5. Top Movers */}
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                                <h3 className="font-bold text-lg text-gray-800 mb-4">Top Market Movers</h3>
                                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {topMovers.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'up' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {item.type === 'up' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h4 className="font-semibold text-gray-800">{item.product}</h4>
                                                    <span className={`text-xs font-bold ${item.type === 'up' ? 'text-red-600' : 'text-green-600'}`}>{item.change}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-1">{item.region}</p>
                                                <p className="text-xs text-slate-600 italic">"{item.reason}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                                    View All Commodities
                                </button>
                            </div>
                        </div>

                        {/* 4. Product Demand & Supply Heatmap */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-lg text-gray-800 mb-6">Regional Demand Heatmap</h3>
                            <div className="overflow-x-auto">
                                <div className="min-w-[600px]">
                                    <div className="grid grid-cols-5 gap-4 mb-2 text-sm font-semibold text-gray-500 px-4">
                                        <div className="col-span-1">Product</div>
                                        <div className="text-center">North</div>
                                        <div className="text-center">West</div>
                                        <div className="text-center">South</div>
                                        <div className="text-center">East</div>
                                    </div>
                                    <div className="space-y-3">
                                        {heatmapData.map((row, rIdx) => (
                                            <div key={rIdx} className="grid grid-cols-5 gap-4 items-center bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer group">
                                                <div className="col-span-1 font-medium text-gray-800 flex items-center gap-2 group-hover:text-blue-600">
                                                    {row.product}
                                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                {row.regions.map((region, cIdx) => (
                                                    <div key={cIdx} className="flex justify-center">
                                                        <div className={`px-3 py-1.5 rounded-md border text-xs font-bold uppercase w-24 text-center ${getStatusColor(region.status)}`}>
                                                            {region.status === 'high' ? 'High Demand' : region.status === 'med' ? 'Balanced' : 'Surplus'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-6 text-xs text-gray-500">
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-100 border border-red-200"></span> High Demand / Low Supply</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200"></span> Balanced Market</div>
                                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-100 border border-green-200"></span> Surplus / Overstocked</div>
                            </div>
                        </div>

                        {/* 6. Buyer Insights & 7. Historical Comparison */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Insights */}
                            <div className="lg:col-span-1 space-y-4">
                                <h3 className="font-bold text-lg text-gray-800">AI Buying Insights</h3>
                                {[
                                    { title: 'Best Time to Buy', text: 'Buy Wheat in the next 10 days before price spikes by ~8%.', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                                    { title: 'Cost Saving Opp', text: 'Switching to West region suppliers for Cotton can save 12%.', icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
                                    { title: 'Supply Alert', text: 'Rice supply tightening in South due to logistical delays.', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                                ].map((card, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border ${card.border} ${card.bg}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <card.icon size={18} className={card.color} />
                                            <h4 className={`font-bold text-sm ${card.color}`}>{card.title}</h4>
                                        </div>
                                        <p className="text-sm text-gray-700">{card.text}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Historical Chart */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-lg text-gray-800 mb-6">Historical Price Comparison</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={historicalData} layout="vertical" barSize={30}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#475569' }} width={100} />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                {historicalData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 2 ? '#2563EB' : '#CBD5E1'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-center text-sm text-gray-500 mt-2">Current prices are <span className="text-red-600 font-bold">10.8% higher</span> than last season average.</p>
                            </div>
                        </div>

                        {/* 8. CTA Section */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-lg">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Ready to procure?</h2>
                                <p className="text-slate-300">Use these insights to negotiate better deals with our verified suppliers.</p>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => navigate('/saved-suppliers')} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl font-medium transition-all">
                                    View Suppliers
                                </button>
                                <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-[var(--admin-accent)] hover:bg-[var(--admin-accent-hover)] text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
                                    Buy Now <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default MarketAnalyticsPage;
