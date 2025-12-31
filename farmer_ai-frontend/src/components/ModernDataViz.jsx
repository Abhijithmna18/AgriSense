import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, TrendingUp, AlertCircle, Sprout, Database, Server } from 'lucide-react';


const ModernDataViz = ({ config }) => {
    // Default fallback data if config is missing
    const defaultData = {
        title: "Performance Dashboard",
        description: "Real-time analytics for data-driven decision making.",
        metrics: [
            { label: "Plant Health Index", isLive: false, demoValue: "98.5%", progress: 98, status: "Optimal" },
            { label: "Water Usage Reduction", isLive: false, demoValue: "42%", progress: 42, status: "Optimal" },
            { label: "Nitrogen & pH Levels", isLive: false, demoValue: "Optimal", progress: 85, status: "Optimal" }
        ],
        chart: {
            title: "Crop Yield Projection",
            manualData: [
                { month: 'Jan', projected: 30, actual: 25 },
                { month: 'Feb', projected: 45, actual: 35 },
                { month: 'Mar', projected: 55, actual: 40 },
                { month: 'Apr', projected: 70, actual: 55 },
                { month: 'May', projected: 65, actual: 50 },
                { month: 'Jun', projected: 85, actual: 65 },
                { month: 'Jul', projected: 75, actual: 60 },
                { month: 'Aug', projected: 90, actual: 75 },
            ],
            legendLabels: { projected: "Projected", actual: "Actual" }
        },
        systemStatus: {
            showLiveFeed: true,
            showServerLoad: true,
            showDbStatus: true
        }
    };

    const perfConfig = config?.performance || defaultData;
    const { title, description, metrics, chart, systemStatus } = perfConfig;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Critical': return { bg: 'bg-red-50', text: 'text-red-500', bar: 'bg-red-500', barBg: 'bg-red-100' };
            case 'Warning': return { bg: 'bg-yellow-50', text: 'text-yellow-600', bar: 'bg-yellow-500', barBg: 'bg-yellow-100' };
            default: return { bg: 'bg-emerald-50', text: 'text-emerald-500', bar: 'bg-emerald-500', barBg: 'bg-emerald-100' };
        }
    };

    const getIcon = (index) => {
        const icons = [AlertCircle, Droplets, Sprout];
        return icons[index % icons.length];
    };

    return (
        <section id="data" className="py-24 bg-soft-gray">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <span className="text-muted-green font-semibold tracking-wider uppercase text-xs">Farm Intelligence</span>
                        <h2 className="text-3xl font-bold text-slate-900 mt-2">
                            {title || defaultData.title}
                        </h2>
                        <p className="text-slate-500 mt-2">
                            {description || defaultData.description}
                        </p>
                    </div>

                    {/* System Status Indicators */}
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {systemStatus?.showLiveFeed && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm text-xs font-medium text-emerald-600">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live Feed
                            </div>
                        )}
                        {systemStatus?.showServerLoad && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm text-xs font-medium text-blue-600">
                                <Server size={12} /> Server Nominal
                            </div>
                        )}
                        {systemStatus?.showDbStatus && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm text-xs font-medium text-purple-600">
                                <Database size={12} /> DB Connected
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Dynamic Metric Cards */}
                    {(metrics || defaultData.metrics).map((metric, index) => {
                        const colors = getStatusColor(metric.status);
                        const Icon = getIcon(index);
                        return (
                            <motion.div
                                key={index}
                                whileHover={{ y: -2 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 uppercase">Metric</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{metric.isLive ? 'LIVE' : metric.demoValue}</h3>
                                <p className="text-sm text-slate-500 mb-6">{metric.label}</p>

                                {/* Progress Bar Visual */}
                                <div className="space-y-1">
                                    <div className={`w-full h-2 rounded-full overflow-hidden ${colors.barBg}`}>
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
                                            style={{ width: `${metric.progress || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>Status</span>
                                        <span className={`font-medium ${colors.text}`}>{metric.status}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Main Chart */}
                    <div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-slate-100 mt-2">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-muted-green" />
                                    {chart?.title || defaultData.chart.title}
                                </h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-muted-green"></span>
                                    <span className="text-xs text-slate-500">{chart?.legendLabels?.projected || 'Projected'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                                    <span className="text-xs text-slate-500">{chart?.legendLabels?.actual || 'Actual'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-64 flex items-end justify-between gap-6 px-4 relative">
                            {/* Background Grid */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="border-t border-slate-50 w-full h-0"></div>
                                ))}
                            </div>

                            {/* Chart Bars */}
                            {(chart?.manualData || defaultData.chart.manualData).map((data, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end gap-2 relative z-10 h-full group">
                                    <div className="flex gap-1 items-end h-full justify-center">
                                        <div
                                            className="w-3 bg-slate-200 rounded-t-sm transition-all duration-500"
                                            style={{ height: `${data.actual}%` }}
                                        ></div>
                                        <div
                                            className="w-3 bg-muted-green rounded-t-sm transition-all duration-700 hover:bg-emerald-600"
                                            style={{ height: `${data.projected}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium text-center">{data.month}</span>

                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                        {data.projected}% / {data.actual}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ModernDataViz;
