import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MarketInsightCard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Mock data for initial display (since backend prediction requires specific input)
    // In real implementation, this would fetch from /api/market-prices/predict or similar
    const [insight, setInsight] = useState({
        crop: 'Wheat',
        recommendation: 'HOLD',
        confidence: 85,
        trend: 'rising',
        currentPrice: 2150,
        projectedPrice: 2280,
        reasoning: "Supply shortage in northern mandis is driving prices up. Better to wait 7 days."
    });

    const [chartData, setChartData] = useState([
        { day: '1', price: 2100 },
        { day: '2', price: 2120 },
        { day: '3', price: 2110 },
        { day: '4', price: 2140 },
        { day: '5', price: 2150 },
        { day: '6', price: 2200, projected: true }, // Projected
        { day: '7', price: 2280, projected: true }, // Projected
    ]);

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Helper for color based on recommendation
    const getStatusColor = (rec) => {
        switch (rec) {
            case 'SELL': return 'text-red-600 bg-red-50 border-red-100';
            case 'BUY': return 'text-green-600 bg-green-50 border-green-100';
            case 'HOLD': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    if (loading) return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center min-h-[300px]">
            <Loader className="animate-spin text-gray-400" />
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col relative overflow-hidden group">
            {/* Header */}
            <div className="flex justify-between items-start mb-4 z-10">
                <div>
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        Market Command
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">AI Beta</span>
                    </h3>
                    <p className="text-sm text-gray-500">Live decision support for <strong>{insight.crop}</strong></p>
                </div>
                <div className={`px-3 py-1 rounded-lg border text-sm font-bold flex items-center gap-1 ${getStatusColor(insight.recommendation)}`}>
                    {insight.recommendation === 'rising' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {insight.recommendation}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 z-10">
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">₹{insight.currentPrice}</span>
                    <span className="text-sm text-gray-500 mb-1">/ quintal</span>
                    <span className="text-xs font-medium text-green-600 mb-1 ml-auto">
                        Target: ₹{insight.projectedPrice}
                    </span>
                </div>

                <div className="h-[120px] w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontSize: '12px', color: '#1F2937' }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#2563EB"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-800 leading-relaxed">
                        <strong>AI Analysis:</strong> {insight.reasoning}
                    </p>
                </div>
            </div>

            {/* Footer Action */}
            <button
                onClick={() => navigate('/market-analytics')}
                className="mt-4 w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2 z-10"
            >
                View Full Analytics <ArrowRight size={16} />
            </button>

            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
        </div>
    );
};

export default MarketInsightCard;
