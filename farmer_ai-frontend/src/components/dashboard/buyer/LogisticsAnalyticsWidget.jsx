import React, { useState, useEffect } from 'react';
import { TrendingUp, Truck, ShieldAlert, CloudRain, Star } from 'lucide-react';
import api from '../../../services/authApi';

const LogisticsAnalyticsWidget = () => {
    // Mock analytics for the buyer based on ML metrics in the DB
    const [analytics, setAnalytics] = useState({
        averageSpoilageRisk: 14.5,
        historicalDelayPercent: 8.2,
        supplierReliability: 92.4,
        costVsRiskScore: 'Optimal'
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-600" />
                Logistics Risk Analytics
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldAlert className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-600">Avg Spoilage Risk</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics.averageSpoilageRisk}%</div>
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +2.1% this month
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <CloudRain className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-600">Delivery Delay %</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics.historicalDelayPercent}%</div>
                    <p className="text-xs text-gray-500 mt-1">Due to weather factors</p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-gray-600">Supplier Reliability</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics.supplierReliability}%</div>
                    <p className="text-xs text-emerald-600 mt-1 h-3 flex items-center gap-1">
                        Top 10% on Platform
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm font-medium text-gray-600">Cost vs Risk</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{analytics.costVsRiskScore}</div>
                    <p className="text-xs text-gray-500 mt-1">Cold-chain ROI calculation</p>
                </div>
            </div>

            {/* Chart Placeholder for Cost vs Risk Tradeoff */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm">Cold-Chain Investment vs Projected Loss</h4>
                </div>
                <div className="h-32 w-full bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                    <p className="text-xs font-medium text-indigo-400">
                        [ Risk Tradeoff Chart Visualization Here ]
                    </p>
                </div>
            </div>

        </div>
    );
};

export default LogisticsAnalyticsWidget;
