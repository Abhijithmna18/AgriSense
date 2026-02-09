import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw, Loader2, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/authApi';

const VendorMarketTrends = () => {
    const [selectedCrop, setSelectedCrop] = useState('wheat');
    const [location, setLocation] = useState('');
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [prediction, setPrediction] = useState(null);

    const crops = [
        { id: 'wheat', name: 'Wheat' },
        { id: 'rice', name: 'Rice' },
        { id: 'corn', name: 'Corn' },
        { id: 'potato', name: 'Potato' },
        { id: 'onion', name: 'Onion' },
        { id: 'tomato', name: 'Tomato' }
    ];

    useEffect(() => {
        fetchPrices();
    }, [selectedCrop, location]);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/market-prices/${selectedCrop}`, {
                params: { location }
            });

            // Format dates for chart
            const formattedData = data.data.map(item => ({
                ...item,
                dateStr: new Date(item.date).toLocaleDateString()
            }));

            setPrices(formattedData);
            setPrediction(null); // Reset prediction on new data
        } catch (error) {
            console.error('Failed to fetch prices', error);
            toast.error('Failed to load price history');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (prices.length === 0) {
            toast.error('No data to analyze');
            return;
        }

        setAnalyzing(true);
        try {
            const currentPrice = prices[prices.length - 1].price;

            const { data } = await api.post('/api/market-prices/predict', {
                crop: selectedCrop,
                location,
                currentPrice
            });

            setPrediction(data.data);
            toast.success('Market analysis complete!');
        } catch (error) {
            console.error('Analysis failed', error);
            toast.error('Failed to generate market analysis');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSeedData = async () => {
        try {
            await api.post('/api/market-prices/seed');
            toast.success('Mock data seeded successfully!');
            fetchPrices();
        } catch (error) {
            toast.error('Failed to seed data');
        }
    };

    const getRecommendationColor = (rec) => {
        switch (rec?.toUpperCase()) {
            case 'SELL': return 'text-red-600 bg-red-50 border-red-200';
            case 'BUY': return 'text-green-600 bg-green-50 border-green-200';
            case 'HOLD': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'rising': return <TrendingUp className="text-green-500" />;
            case 'falling': return <TrendingDown className="text-red-500" />;
            default: return <Minus className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" />
                        Market Price Trends
                    </h1>
                    <p className="text-gray-500">AI-powered price tracking and selling advice</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSeedData}
                        className="text-sm text-gray-500 hover:text-blue-600 underline"
                    >
                        Load Sample Data
                    </button>
                    <button
                        onClick={fetchPrices}
                        className="p-2 text-gray-400 hover:text-blue-600 transition"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Crop</label>
                        <select
                            value={selectedCrop}
                            onChange={(e) => setSelectedCrop(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {crops.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location Filter (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Pune, Mandi..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${prices.length === 0
                                ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:to-indigo-700 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {analyzing ? (
                                <><Loader2 className="animate-spin" /> Analyzing...</>
                            ) : (
                                <><Sparkles size={20} /> Analyze AI Trends</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Price History (Last 30 Days)</h3>

                    {loading ? (
                        <div className="h-80 flex items-center justify-center text-gray-400">
                            <Loader2 className="animate-spin mr-2" /> Loading data...
                        </div>
                    ) : prices.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={prices}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="dateStr"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#2563EB"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                        name={`Price (₹/${prices[0]?.unit})`}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <AlertCircle size={32} className="mb-2 text-blue-500" />
                            <p className="text-gray-500 mb-4">No price data available for analysis.</p>
                            <button
                                onClick={handleSeedData}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Load Real Market Data
                            </button>
                        </div>
                    )}
                </div>

                {/* AI Prediction Card */}
                <div className="lg:col-span-1">
                    {prediction ? (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={120} className="text-blue-500" />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Market Recommendation</h3>

                            <div className="space-y-6 relative z-10">
                                <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${getRecommendationColor(prediction.recommendation)}`}>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">Advice</p>
                                        <p className="text-3xl font-black">{prediction.recommendation}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold opacity-70">Confidence</p>
                                        <p className="text-xl font-bold">{prediction.confidence_score}%</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Predicted Trend</p>
                                        <div className="flex items-center gap-2 font-bold text-gray-900 capitalize">
                                            {getTrendIcon(prediction.predicted_trend)}
                                            {prediction.predicted_trend}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">Forecast (Next Week)</p>
                                        <p className="font-bold text-gray-900">₹{prediction.forecast_next_week}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-2">Analysis:</p>
                                    <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                        {prediction.reasoning}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 h-full flex flex-col items-center justify-center text-center">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <Sparkles className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Market Analyst</h3>
                            <p className="text-gray-600 mb-6">
                                Analyzing historical data and market signals to give you actionable advice.
                            </p>
                            <button
                                onClick={handleAnalyze}
                                disabled={prices.length === 0}
                                className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Run Analysis
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorMarketTrends;
