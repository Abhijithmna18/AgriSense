import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calculator, ArrowRight, TrendingUp, AlertCircle, Sprout, Loader } from 'lucide-react';
import api from '../../../services/authApi';
import { useFarm } from '../../../context/FarmContext';

const ProfitabilityAnalysis = ({ dataContext }) => {
    const { activeFarmId } = useFarm();
    const [cropCycles, setCropCycles] = useState([]);
    const [selectedCycleId, setSelectedCycleId] = useState('');
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Basic state for the calculator (fallback if no cycles exist)
    const [cropName, setCropName] = useState('Wheat');
    const [acreage, setAcreage] = useState(5);
    const [expectedYieldPerAcre, setExpectedYieldPerAcre] = useState(2000); // kg
    const [expectedPricePerKg, setExpectedPricePerKg] = useState(25); // ₹

    // Cost breakdown (per acre fallback)
    const [costs, setCosts] = useState({
        seeds: 2500,
        fertilizers: 3000,
        labor: 5000,
        machinery: 2000,
        irrigation: 1500,
        other: 1000
    });

    // Fetch active crop cycles for the farm
    useEffect(() => {
        if (activeFarmId) fetchCropCycles();
    }, [activeFarmId]);

    const fetchCropCycles = async () => {
        try {
            const res = await api.get(`/api/farms/${activeFarmId}/crop-cycles`);
            const cycles = res.data.data || [];
            if (Array.isArray(cycles)) {
                setCropCycles(cycles);
                if (cycles.length > 0 && !selectedCycleId) {
                    setSelectedCycleId(cycles[0]._id);
                }
            }
        } catch (error) {
            console.error("Failed to load crop cycles:", error);
        }
    };

    // Fetch Profitability Data when a cycle is selected
    useEffect(() => {
        if (selectedCycleId) fetchProfitability();
    }, [selectedCycleId]);

    const fetchProfitability = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/finance/profitability/${selectedCycleId}`);
            if (res.data.success) {
                setAnalysisData(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch profitability analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCostChange = (key, value) => {
        setCosts(prev => ({
            ...prev,
            [key]: parseFloat(value) || 0
        }));
    };

    // Derived values (Use fetched data if available, otherwise use interactive mockup)
    const isMock = !analysisData || analysisData.totalExpenses === 0;

    const totalCostPerAcre = Object.values(costs).reduce((a, b) => a + b, 0);
    const totalCost = isMock ? totalCostPerAcre * acreage : analysisData.totalExpenses;
    const totalYield = expectedYieldPerAcre * acreage;
    const expectedRevenue = isMock ? totalYield * expectedPricePerKg : analysisData.totalRevenue;
    const netProfit = isMock ? expectedRevenue - totalCost : analysisData.netProfit;
    const roi = isMock
        ? (totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : 0)
        : analysisData.roi.toFixed(1);

    const costPerKg = isMock
        ? (totalYield > 0 ? (totalCost / totalYield).toFixed(2) : 0)
        : (totalCost / 5000).toFixed(2); // Mocking actual yield volume for real data right now

    // Chart Data
    const costBreakdownData = isMock ? Object.entries(costs).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value * acreage
    })) : analysisData.expenseBreakdown;

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#64748B'];

    const summaryData = [
        { name: 'Total Cost', amount: totalCost, fill: '#EF4444' },
        { name: 'Est. Revenue', amount: expectedRevenue, fill: '#10B981' },
        { name: 'Net Profit', amount: netProfit > 0 ? netProfit : 0, fill: '#3B82F6' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Calculator className="text-indigo-500" />
                        Profitability & ROI Calculator
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Estimate returns and analyze cost breakdowns for upcoming harvests.</p>
                </div>

                {cropCycles.length > 0 && (
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        {cropCycles.map(cycle => (
                            <button
                                key={cycle._id}
                                onClick={() => setSelectedCycleId(cycle._id)}
                                className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-md transition-colors ${selectedCycleId === cycle._id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Sprout size={16} />
                                {cycle.cropName}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-slate-400">
                    <Loader size={32} className="animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Calculator Inputs */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Only show input form if we are operating in mock mode (no real data) */}
                        {isMock && (
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-5">
                                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Harvest Parameters</h3>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Crop Name</label>
                                    <input
                                        type="text"
                                        value={cropName}
                                        onChange={(e) => setCropName(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Acres</label>
                                        <input
                                            type="number"
                                            min="0.1" step="0.1"
                                            value={acreage}
                                            onChange={(e) => setAcreage(parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price / Kg (₹)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={expectedPricePerKg}
                                            onChange={(e) => setExpectedPricePerKg(parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expected Yield (Kg/Acre)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={expectedYieldPerAcre}
                                        onChange={(e) => setExpectedYieldPerAcre(parseFloat(e.target.value) || 0)}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
                                    />
                                </div>

                                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 pt-4">Costs per Acre (₹)</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(costs).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 capitalize">{key}</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={value}
                                                onChange={(e) => handleCostChange(key, e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isMock && (
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3">
                                <h3 className="font-bold text-slate-800">Live Ledger Active</h3>
                                <p className="text-sm text-slate-500">
                                    This analysis is currently pulling real-time data from your categorized transaction ledger.
                                    Log expenses via the Expense Tracker to update this view.
                                </p>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-indigo-200 mt-4">
                                    + Log Expense
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Visualizations & Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Results */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden group">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 pt-1">Total Investment</p>
                                <h3 className="text-2xl font-bold text-slate-800">₹{totalCost.toLocaleString()}</h3>
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 pt-1">Expected Revenue</p>
                                <h3 className="text-2xl font-bold text-slate-800">₹{expectedRevenue.toLocaleString()}</h3>
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            </div>
                            <div className={`p-5 rounded-xl shadow-sm relative overflow-hidden text-white ${netProfit >= 0 ? 'bg-gradient-to-br from-indigo-600 to-indigo-800' : 'bg-gradient-to-br from-rose-500 to-rose-700'}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 -translate-y-10"></div>
                                <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1 pt-1">Return on Investment (ROI)</p>
                                <h3 className="text-3xl font-black">{roi}%</h3>
                                <p className="text-sm font-medium mt-1">Net: {netProfit >= 0 ? '+' : ''}₹{netProfit.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    Cost Breakdown
                                </h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={costBreakdownData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {costBreakdownData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    Profitability Margin
                                </h4>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={summaryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                            <Tooltip cursor={{ fill: '#F8FAFC' }} formatter={(value) => `₹${value.toLocaleString()}`} />
                                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                                {summaryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Insights Box */}
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex gap-4">
                            <TrendingUp className="text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-indigo-900 mb-1">Financial Insights</h4>
                                <ul className="text-sm text-indigo-800 space-y-1 list-disc list-inside">
                                    {isMock ? (
                                        <>
                                            <li>Your production cost is <strong>₹{costPerKg}/kg</strong>. Selling below this price will result in a loss.</li>
                                            <li>{roi > 50 ? 'Excellent expected ROI! Ensure you lock in buyers to mitigate market price volatility.' : roi > 20 ? 'Solid expected margin. Track expenses closely during the season.' : 'Low margin alert. Consider optimizing input costs or exploring alternative crops.'}</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>You have logged ₹{totalCost.toLocaleString()} in real expenses against this cycle.</li>
                                            <li>The current trajectory suggests an ROI of {roi}%. Make sure to log any finalized marketplace sales to see your exact revenue.</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfitabilityAnalysis;
