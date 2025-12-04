import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const AnalyticsPanel = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart - Yield Forecast */}
            <div className="lg:col-span-2 glass p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-serif font-bold text-dark-green-text dark:text-warm-ivory">Yield Forecast</h3>
                        <p className="text-xs text-dark-green-text/50">Projected output for next season</p>
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <MoreHorizontal size={20} className="text-dark-green-text/40" />
                    </button>
                </div>

                {/* Simulated Line Chart */}
                <div className="h-64 w-full flex items-end justify-between gap-2 px-2 relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-px bg-dark-green-text/5 border-t border-dashed border-dark-green-text/10"></div>
                        ))}
                    </div>

                    {/* Data Points / Line Simulation */}
                    {[40, 65, 55, 80, 70, 90, 85].map((height, i) => (
                        <div key={i} className="relative flex-1 flex flex-col justify-end items-center group">
                            <div
                                className="w-full bg-gradient-to-t from-primary-green/20 to-primary-green/5 rounded-t-lg transition-all duration-500 hover:bg-primary-green/30"
                                style={{ height: `${height}%` }}
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                                    <div className="bg-deep-forest text-warm-ivory text-xs py-1 px-2 rounded shadow-lg">
                                        {height * 10} tons
                                    </div>
                                </div>
                            </div>
                            <div className="w-2 h-2 bg-accent-gold rounded-full mt-[-4px] z-10 shadow-gold"></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-dark-green-text/40 font-medium uppercase tracking-wider">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>

            {/* Secondary Chart - Crop Health */}
            <div className="glass p-6 rounded-2xl flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-serif font-bold text-dark-green-text dark:text-warm-ivory">Crop Health</h3>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <MoreHorizontal size={20} className="text-dark-green-text/40" />
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                    {/* Donut Chart Simulation */}
                    <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                            {/* Segment 1 */}
                            <circle
                                cx="50" cy="50" r="40"
                                fill="transparent"
                                stroke="var(--primary-green)"
                                strokeWidth="10"
                                strokeDasharray="180 251"
                                strokeLinecap="round"
                                className="drop-shadow-lg"
                            />
                            {/* Segment 2 */}
                            <circle
                                cx="50" cy="50" r="40"
                                fill="transparent"
                                stroke="#D4AF37"
                                strokeWidth="10"
                                strokeDasharray="50 251"
                                strokeDashoffset="-190"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold font-serif text-dark-green-text dark:text-warm-ivory">92%</span>
                            <span className="text-xs text-dark-green-text/50 uppercase tracking-widest">Healthy</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary-green"></div>
                            <span className="text-dark-green-text/70">Optimal</span>
                        </div>
                        <span className="font-bold text-dark-green-text">75%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-accent-gold"></div>
                            <span className="text-dark-green-text/70">Attention</span>
                        </div>
                        <span className="font-bold text-dark-green-text">25%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPanel;
