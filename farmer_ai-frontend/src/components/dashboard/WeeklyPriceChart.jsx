import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area
} from 'recharts';
import { Search, AlertCircle, TrendingUp } from 'lucide-react';

const WeeklyPriceChart = () => {
    const [cropName, setCropName] = useState('');
    const [chartData, setChartData] = useState([]);
    const [error, setError] = useState('');
    const [searchedCrop, setSearchedCrop] = useState('');

    // Mock Data Store
    const priceDatabase = {
        chili: [
            { day: 'Mon', price: 120 },
            { day: 'Tue', price: 125 },
            { day: 'Wed', price: 118 },
            { day: 'Thu', price: 122 },
            { day: 'Fri', price: 130 },
            { day: 'Sat', price: 135 },
            { day: 'Sun', price: 128 }
        ],
        cotton: [
            { day: 'Mon', price: 5800 },
            { day: 'Tue', price: 5850 },
            { day: 'Wed', price: 5900 },
            { day: 'Thu', price: 5820 },
            { day: 'Fri', price: 5950 },
            { day: 'Sat', price: 6000 },
            { day: 'Sun', price: 5980 }
        ],
        onion: [
            { day: 'Mon', price: 25 },
            { day: 'Tue', price: 28 },
            { day: 'Wed', price: 24 },
            { day: 'Thu', price: 26 },
            { day: 'Fri', price: 30 },
            { day: 'Sat', price: 32 },
            { day: 'Sun', price: 29 }
        ]
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const query = cropName.toLowerCase().trim();

        if (!query) return;

        if (priceDatabase[query]) {
            setChartData(priceDatabase[query]);
            setSearchedCrop(cropName); // Keep original casing for display
            setError('');
        } else {
            setChartData([]);
            setSearchedCrop('');
            setError(`No data found for "${cropName}". Try 'chili', 'cotton', or 'onion'.`);
        }
    };

    // Custom Tooltip to match dashboard style
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-deep-forest text-warm-ivory text-xs py-2 px-3 rounded shadow-lg border border-accent-gold/20">
                    <p className="font-bold mb-1">{label}</p>
                    <p className="text-accent-gold">
                        ₹{payload[0].value} / quintal
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                    <TrendingUp className="text-accent-gold" size={20} />
                    Weekly Price Trend
                </h3>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative mb-6">
                <input
                    type="text"
                    placeholder="Enter crop name (e.g. Chili)"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:border-accent-gold focus:ring-1 focus:ring-accent-gold outline-none transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-green text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Search size={16} />
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-sm mb-4">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Chart Area */}
            <div className="flex-1 min-h-[250px] w-full relative">
                {!chartData.length ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-40">
                        <TrendingUp size={48} className="mb-2" />
                        <p className="font-medium">Enter a crop to view price trends</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-bold uppercase tracking-wider opacity-70">
                                {searchedCrop} Prices
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-bold">
                                +{(chartData[chartData.length - 1].price - chartData[0].price) > 0 ? 'Rising' : 'Falling'}
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.1)"
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#D4AF37', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#D4AF37"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#D4AF37', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, fill: '#D4AF37', stroke: '#fff' }}
                                    animationDuration={1500}
                                />
                                {/* Add a subtle area fill below the line for that "dashboard" look */}
                                <Area type="monotone" dataKey="price" stroke="none" fill="url(#colorPrice)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>
        </div>
    );
};

export default WeeklyPriceChart;
