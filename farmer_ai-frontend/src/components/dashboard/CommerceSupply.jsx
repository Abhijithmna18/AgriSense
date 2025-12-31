import React from 'react';
import { ShoppingBag, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';

const CommerceSupply = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Input Recommendations */}
            <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-5 border border-stone-100 dark:border-white/5">
                <h3 className="text-lg font-serif font-bold text-dark-green-text dark:text-warm-ivory mb-4 flex items-center gap-2">
                    <ShoppingBag size={20} className="text-primary-green" />
                    Recommended Inputs
                </h3>
                <div className="space-y-3">
                    {data.recommendations.map(item => (
                        <div key={item.id} className="bg-white dark:bg-black/20 p-4 rounded-lg border border-stone-200 dark:border-white/5 flex justify-between items-center group hover:border-primary-green/50 transition-colors">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{item.name}</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">{item.type}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{item.price}</p>
                                <button className="text-xs bg-primary-green text-white px-3 py-1.5 rounded mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Marketplace Trends */}
            <div className="bg-stone-50 dark:bg-white/5 rounded-xl p-5 border border-stone-100 dark:border-white/5">
                <h3 className="text-lg font-serif font-bold text-dark-green-text dark:text-warm-ivory mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-accent-gold" />
                    Marketplace Trends
                </h3>
                <div className="space-y-3">
                    {data.marketplace.map(item => (
                        <div key={item.id} className="bg-white dark:bg-black/20 p-4 rounded-lg border border-stone-200 dark:border-white/5 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{item.item}</h4>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    {item.trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                                    {item.trend === 'down' && <TrendingUp size={12} className="text-red-500 transform rotate-180" />}
                                    {item.trend === 'stable' && <span className="text-gray-400">-</span>}
                                    <span>Trend: {item.trend.toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{item.rate}</p>
                                <p className="text-[10px] text-gray-400">Current Mandi Price</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-3 items-start border border-blue-100 dark:border-blue-800/30">
                    <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Market Insight</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">Mustard prices expected to rise by 5% next week due to export demand.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommerceSupply;
