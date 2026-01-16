import React from 'react';
import { BarChart2, ArrowUp, ArrowDown } from 'lucide-react';

const MarketInsightsWidget = () => {
    return (
        <div className="admin-card h-full bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white border-none">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <BarChart2 className="text-indigo-300" size={20} />
                        Market Insights
                    </h3>
                    <p className="text-sm text-indigo-200">Regional price trends</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-indigo-100">Wheat (Local)</span>
                        <span className="text-lg font-bold">↑ +12%</span>
                    </div>
                    <div className="w-full bg-indigo-900/50 rounded-full h-1.5">
                        <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <p className="text-[10px] text-indigo-300 mt-1">High demand expected next week</p>
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-indigo-100">Rice (Basmati)</span>
                        <span className="text-lg font-bold text-red-300">↓ -5%</span>
                    </div>
                    <div className="w-full bg-indigo-900/50 rounded-full h-1.5">
                        <div className="bg-red-400 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <p className="text-[10px] text-indigo-300 mt-1">Supply surplus in Northern region</p>
                </div>

                <div className="p-3 bg-indigo-800/30 rounded-lg border border-indigo-500/30 backdrop-blur-sm">
                    <p className="text-xs font-medium text-indigo-100 mb-1">💡 Buying Tip</p>
                    <p className="text-xs text-indigo-300 italic">
                        "Consider bulk booking for Corn now to lock in lower rates before seasonal spike."
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MarketInsightsWidget;
