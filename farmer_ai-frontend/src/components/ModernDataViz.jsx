import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, TrendingUp, AlertCircle, Sprout, BarChart2 } from 'lucide-react';

const ModernDataViz = () => {
    return (
        <section id="data" className="py-24 bg-soft-gray">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <span className="text-muted-green font-semibold tracking-wider uppercase text-xs">Farm Intelligence</span>
                        <h2 className="text-3xl font-bold text-slate-900 mt-2">
                            Performance Dashboard
                        </h2>
                        <p className="text-slate-500 mt-2">
                            Real-time analytics for data-driven decision making.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Metric Card 1: Disease Detection */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                                <AlertCircle size={20} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 uppercase">Health</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">98.5%</h3>
                        <p className="text-sm text-slate-500 mb-6">Disease Detection Accuracy</p>

                        {/* Mini Chart Visual */}
                        <div className="flex items-end gap-1 h-12">
                            {[40, 30, 60, 45, 80, 65, 90, 85, 98].map((h, i) => (
                                <div key={i} className="flex-1 bg-red-100 rounded-sm relative group">
                                    <div
                                        className="absolute bottom-0 w-full bg-red-500 rounded-sm transition-all duration-500"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Metric Card 2: Water Savings */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                                <Droplets size={20} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 uppercase">Resource</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">42%</h3>
                        <p className="text-sm text-slate-500 mb-6">Water Usage Reduction</p>

                        {/* Mini Chart Visual */}
                        <div className="flex items-end gap-1 h-12">
                            {[60, 55, 50, 45, 40, 35, 30, 25, 20].map((h, i) => (
                                <div key={i} className="flex-1 bg-blue-100 rounded-sm relative group">
                                    <div
                                        className="absolute bottom-0 w-full bg-blue-500 rounded-sm transition-all duration-500"
                                        style={{ height: `${100 - h}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Metric Card 3: Soil Health */}
                    <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                                <Sprout size={20} />
                            </div>
                            <span className="text-xs font-medium text-slate-400 uppercase">Soil</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Optimal</h3>
                        <p className="text-sm text-slate-500 mb-6">Nitrogen & pH Levels</p>

                        {/* Mini Chart Visual */}
                        <div className="flex items-center justify-between gap-1 h-12">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full w-3/4 rounded-full"></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">7.2 pH</span>
                        </div>
                    </motion.div>

                    {/* Main Chart: Yield Projection */}
                    <div className="lg:col-span-3 bg-white p-8 rounded-xl shadow-sm border border-slate-100 mt-2">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-muted-green" />
                                    Crop Yield Projection
                                </h3>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-muted-green"></span>
                                    <span className="text-xs text-slate-500">Projected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                                    <span className="text-xs text-slate-500">Historical</span>
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

                            {[
                                { label: 'Jan', proj: 30, hist: 25 },
                                { label: 'Feb', proj: 45, hist: 35 },
                                { label: 'Mar', proj: 55, hist: 40 },
                                { label: 'Apr', proj: 70, hist: 55 },
                                { label: 'May', proj: 65, hist: 50 },
                                { label: 'Jun', proj: 85, hist: 65 },
                                { label: 'Jul', proj: 75, hist: 60 },
                                { label: 'Aug', proj: 90, hist: 75 },
                            ].map((data, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end gap-2 relative z-10 h-full group">
                                    <div className="flex gap-1 items-end h-full justify-center">
                                        <div
                                            className="w-3 bg-slate-200 rounded-t-sm transition-all duration-500"
                                            style={{ height: `${data.hist}%` }}
                                        ></div>
                                        <div
                                            className="w-3 bg-muted-green rounded-t-sm transition-all duration-700 hover:bg-emerald-600"
                                            style={{ height: `${data.proj}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium text-center">{data.label}</span>

                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {data.proj}% Yield
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
