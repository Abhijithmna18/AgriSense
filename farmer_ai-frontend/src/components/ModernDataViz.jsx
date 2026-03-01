import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Droplets, 
    TrendingUp, 
    AlertCircle, 
    Sprout, 
    Database, 
    Server,
    BarChart3,
    LineChart,
    PieChart,
    Zap,
    Cloud,
    Thermometer,
    Wind,
    Sun,
    ArrowUp,
    ArrowDown,
    Minus
} from 'lucide-react';

const ModernDataViz = ({ config }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [animatedValues, setAnimatedValues] = useState({});

    // Default fallback data if config is missing
    const defaultData = {
        title: "Real-Time Farm Intelligence",
        description: "AI-powered analytics and insights for smarter farming decisions.",
        metrics: [
            { 
                label: "Crop Health Score", 
                isLive: false, 
                demoValue: "98.5", 
                unit: "%",
                progress: 98, 
                status: "Optimal",
                trend: "up",
                change: "+2.3%",
                icon: "sprout"
            },
            { 
                label: "Water Efficiency", 
                isLive: false, 
                demoValue: "42", 
                unit: "%",
                progress: 42, 
                status: "Optimal",
                trend: "up",
                change: "+8.5%",
                icon: "droplets"
            },
            { 
                label: "Soil Quality Index", 
                isLive: false, 
                demoValue: "85", 
                unit: "/100",
                progress: 85, 
                status: "Optimal",
                trend: "stable",
                change: "0%",
                icon: "activity"
            },
            { 
                label: "Yield Prediction", 
                isLive: false, 
                demoValue: "12.4", 
                unit: "tons/ha",
                progress: 75, 
                status: "Optimal",
                trend: "up",
                change: "+5.2%",
                icon: "trending"
            }
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
            legendLabels: { projected: "AI Projected", actual: "Actual Yield" }
        },
        weatherData: {
            temperature: 28,
            humidity: 65,
            windSpeed: 12,
            condition: "Partly Cloudy"
        },
        systemStatus: {
            showLiveFeed: true,
            showServerLoad: true,
            showDbStatus: true
        }
    };

    const perfConfig = config?.performance || defaultData;
    const { title, description, metrics, chart, weatherData, systemStatus } = perfConfig;

    // Animate counter values
    useEffect(() => {
        const timer = setTimeout(() => {
            const newValues = {};
            (metrics || defaultData.metrics).forEach((metric, index) => {
                newValues[index] = parseFloat(metric.demoValue);
            });
            setAnimatedValues(newValues);
        }, 100);
        return () => clearTimeout(timer);
    }, [metrics]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Critical': return { 
                bg: 'bg-red-50', 
                text: 'text-red-600', 
                bar: 'bg-gradient-to-r from-red-500 to-red-600', 
                barBg: 'bg-red-100',
                border: 'border-red-200',
                glow: 'shadow-red-500/20'
            };
            case 'Warning': return { 
                bg: 'bg-amber-50', 
                text: 'text-amber-600', 
                bar: 'bg-gradient-to-r from-amber-500 to-orange-500', 
                barBg: 'bg-amber-100',
                border: 'border-amber-200',
                glow: 'shadow-amber-500/20'
            };
            default: return { 
                bg: 'bg-emerald-50', 
                text: 'text-emerald-600', 
                bar: 'bg-gradient-to-r from-emerald-500 to-emerald-600', 
                barBg: 'bg-emerald-100',
                border: 'border-emerald-200',
                glow: 'shadow-emerald-500/20'
            };
        }
    };

    const getIcon = (iconName) => {
        const iconMap = {
            sprout: Sprout,
            droplets: Droplets,
            activity: Activity,
            trending: TrendingUp,
            alert: AlertCircle
        };
        return iconMap[iconName] || Activity;
    };

    const getTrendIcon = (trend) => {
        switch(trend) {
            case 'up': return ArrowUp;
            case 'down': return ArrowDown;
            default: return Minus;
        }
    };

    const getTrendColor = (trend) => {
        switch(trend) {
            case 'up': return 'text-emerald-600 bg-emerald-50';
            case 'down': return 'text-red-600 bg-red-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    return (
        <section id="data" className="relative py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
            </div>

            <div className="relative container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-6"
                    >
                        <BarChart3 className="text-blue-600" size={20} />
                        <span className="text-blue-700 font-semibold text-sm">Data Intelligence</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
                    >
                        {title || defaultData.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        {description || defaultData.description}
                    </motion.p>

                    {/* System Status Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-3 mt-8"
                    >
                        {systemStatus?.showLiveFeed && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-emerald-100 text-sm font-medium text-emerald-600">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                Live Data Feed
                            </div>
                        )}
                        {systemStatus?.showServerLoad && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-blue-100 text-sm font-medium text-blue-600">
                                <Server size={14} /> AI Models Active
                            </div>
                        )}
                        {systemStatus?.showDbStatus && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-purple-100 text-sm font-medium text-purple-600">
                                <Database size={14} /> Cloud Synced
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {(metrics || defaultData.metrics).map((metric, index) => {
                        const colors = getStatusColor(metric.status);
                        const Icon = getIcon(metric.icon);
                        const TrendIcon = getTrendIcon(metric.trend);
                        const trendColor = getTrendColor(metric.trend);

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className={`relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border ${colors.border} overflow-hidden group`}
                            >
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} shadow-lg ${colors.glow}`}>
                                            <Icon size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trendColor}`}>
                                            <TrendIcon size={12} />
                                            {metric.change}
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex items-baseline gap-2">
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-4xl font-bold text-slate-900"
                                            >
                                                {animatedValues[index]?.toFixed(1) || metric.demoValue}
                                            </motion.span>
                                            <span className="text-lg text-slate-500 font-medium">{metric.unit}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600 font-medium mb-4">{metric.label}</p>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className={`w-full h-2 rounded-full overflow-hidden ${colors.barBg}`}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${metric.progress || 0}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: index * 0.1 }}
                                                className={`h-full rounded-full ${colors.bar}`}
                                            ></motion.div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400">Performance</span>
                                            <span className={`text-xs font-bold ${colors.text}`}>{metric.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative Corner */}
                                <div className={`absolute -top-8 -right-8 w-24 h-24 ${colors.bg} rounded-full opacity-20`}></div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100"
                >
                    {/* Chart Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <LineChart size={24} className="text-emerald-600" />
                                </div>
                                {chart?.title || defaultData.chart.title}
                            </h3>
                            <p className="text-sm text-slate-500">Comparing AI predictions with actual performance</p>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg"></div>
                                <span className="text-sm text-slate-600 font-medium">{chart?.legendLabels?.projected || 'AI Projected'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 shadow-lg"></div>
                                <span className="text-sm text-slate-600 font-medium">{chart?.legendLabels?.actual || 'Actual Yield'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="relative h-80 flex items-end justify-between gap-4 px-2">
                        {/* Background Grid */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-xs text-slate-400 w-8 text-right">{100 - i * 20}%</span>
                                    <div className="border-t border-slate-100 w-full h-0"></div>
                                </div>
                            ))}
                        </div>

                        {/* Chart Bars */}
                        <div className="relative z-10 w-full flex items-end justify-between gap-3 h-full pt-8">
                            {(chart?.manualData || defaultData.chart.manualData).map((data, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-3 h-full group">
                                    <div className="flex gap-2 items-end h-full justify-center w-full">
                                        {/* Actual Bar */}
                                        <motion.div
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${data.actual}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                            className="w-full max-w-[20px] bg-gradient-to-t from-slate-300 to-slate-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all relative"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {data.actual}%
                                            </div>
                                        </motion.div>
                                        {/* Projected Bar */}
                                        <motion.div
                                            initial={{ height: 0 }}
                                            whileInView={{ height: `${data.projected}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, delay: i * 0.1 + 0.1 }}
                                            className="w-full max-w-[20px] bg-gradient-to-t from-emerald-500 to-emerald-600 rounded-t-lg shadow-lg hover:shadow-xl transition-all relative"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {data.projected}%
                                            </div>
                                        </motion.div>
                                    </div>
                                    <span className="text-xs text-slate-600 font-semibold">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Footer Stats */}
                    <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-slate-100">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-emerald-600 mb-1">94.2%</div>
                            <div className="text-sm text-slate-500">Prediction Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-1">+18%</div>
                            <div className="text-sm text-slate-500">Yield Improvement</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-1">2.4M</div>
                            <div className="text-sm text-slate-500">Data Points Analyzed</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ModernDataViz;
