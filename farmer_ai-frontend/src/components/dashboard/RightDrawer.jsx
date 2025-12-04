import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Calendar, Sliders } from 'lucide-react';

const RightDrawer = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-80 bg-warm-ivory dark:bg-deep-forest border-l border-accent-gold/20 shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-serif font-bold text-dark-green-text dark:text-warm-ivory flex items-center gap-2">
                                    <Sliders size={20} className="text-accent-gold" />
                                    Advanced Controls
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-black/5 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-dark-green-text/50" />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="space-y-8">
                                {/* Date Range */}
                                <div>
                                    <label className="text-xs font-bold text-dark-green-text/50 uppercase tracking-widest mb-3 block">Date Range</label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-green" />
                                            <select className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-primary-green/20 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold outline-none text-sm">
                                                <option>Last 7 Days</option>
                                                <option>Last 30 Days</option>
                                                <option>This Season</option>
                                                <option>Custom Range</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Crop Selection */}
                                <div>
                                    <label className="text-xs font-bold text-dark-green-text/50 uppercase tracking-widest mb-3 block">Crop Selection</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Wheat', 'Corn', 'Rice', 'Soybean'].map((crop) => (
                                            <button key={crop} className="px-3 py-1.5 rounded-lg text-sm border border-primary-green/20 hover:border-accent-gold hover:text-accent-gold transition-colors">
                                                {crop}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div>
                                    <label className="text-xs font-bold text-dark-green-text/50 uppercase tracking-widest mb-3 block">Display Options</label>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Show Weather Alerts</span>
                                            <div className="w-10 h-6 bg-primary-green rounded-full relative cursor-pointer">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">AI Predictions</span>
                                            <div className="w-10 h-6 bg-primary-green rounded-full relative cursor-pointer">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Trend Indicator */}
                                <div className="p-4 bg-primary-green/5 rounded-xl border border-primary-green/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-primary-green">Market Trend</span>
                                        <span className="text-xs font-bold text-accent-gold">+4.2%</span>
                                    </div>
                                    <div className="h-10 flex items-end gap-1">
                                        {[20, 35, 45, 30, 50, 65, 55, 70].map((h, i) => (
                                            <div key={i} className="flex-1 bg-primary-green/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="absolute bottom-0 left-0 w-full p-6 border-t border-accent-gold/10 bg-warm-ivory dark:bg-deep-forest">
                                <button className="w-full py-3 bg-primary-green text-white rounded-xl font-bold shadow-lg shadow-primary-green/30 hover:shadow-xl hover:scale-[1.02] transition-all mb-3">
                                    Apply Filters
                                </button>
                                <button className="w-full py-3 border border-dark-green-text/10 rounded-xl font-medium hover:bg-black/5 transition-colors">
                                    Reset Defaults
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RightDrawer;
