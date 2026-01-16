import React from 'react';
import { TrendingUp, TrendingDown, Minus, Star, MapPin, ArrowRight } from 'lucide-react';

const SmartSourcingPanel = () => {
    const opportunities = [
        { crop: 'Organic Wheat', price: '₹320/ton', trend: 'down', trendVal: '-5%', farmers: 12, topRated: 'Farm Alpha' },
        { crop: 'Basmati Rice', price: '₹850/ton', trend: 'stable', trendVal: '0%', farmers: 8, topRated: 'Green Acres' },
        { crop: 'Sweet Corn', price: '₹210/ton', trend: 'up', trendVal: '+8%', farmers: 15, topRated: 'Sunny Fields' },
    ];

    const getTrendIcon = (trend) => {
        if (trend === 'up') return <TrendingUp size={16} className="text-red-500" />;
        if (trend === 'down') return <TrendingDown size={16} className="text-green-500" />;
        return <Minus size={16} className="text-gray-400" />;
    };

    return (
        <div className="admin-card h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Star className="text-amber-400 fill-amber-400" size={20} />
                        Smart Sourcing
                    </h3>
                    <p className="text-sm text-gray-500">High-demand opportunities in your region</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    View All <ArrowRight size={16} />
                </button>
            </div>

            <div className="space-y-4 flex-1">
                {opportunities.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-800">{item.crop}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <MapPin size={12} />
                                    <span>{item.farmers} Suppliers nearby</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-800">{item.price}</p>
                                <div className="flex items-center justify-end gap-1 text-xs">
                                    {getTrendIcon(item.trend)}
                                    <span className={item.trend === 'down' ? 'text-green-600' : item.trend === 'up' ? 'text-red-500' : 'text-gray-500'}>
                                        {item.trendVal}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                            <span className="text-xs text-gray-500">Best Rated:</span>
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                {item.topRated}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                Find Suppliers
            </button>
        </div>
    );
};

export default SmartSourcingPanel;
