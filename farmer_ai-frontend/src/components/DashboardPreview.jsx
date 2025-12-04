import React from 'react';
import { motion } from 'framer-motion';
import { dashboardFloat } from '../utils/animations';

export const DashboardPreview = () => {
    return (
        <section className="py-32 px-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 mb-6 glass rounded-full"
                    >
                        <span className="text-sm text-[#D4AF37] font-medium">Real-Time Analytics</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-[#F9F8F4] mb-4"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        Data-Driven Decisions
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-[#F9F8F4]/70 text-lg max-w-2xl mx-auto font-light"
                    >
                        Monitor every aspect of your farm with our intelligent dashboard
                    </motion.p>
                </div>

                {/* 3D Dashboard Container */}
                <motion.div
                    variants={dashboardFloat}
                    animate="animate"
                    className="relative max-w-6xl mx-auto"
                    style={{
                        perspective: '1000px',
                    }}
                >
                    <div
                        className="relative"
                        style={{
                            transform: 'rotateX(5deg)',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {/* Dashboard Glass Container */}
                        <div className="glass rounded-3xl p-8 shadow-2xl shadow-[#D4AF37]/10">
                            {/* Dashboard Header */}
                            <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#D4AF37]/20">
                                <div>
                                    <h3 className="text-xl text-[#F9F8F4] font-semibold mb-1">Farm Analytics</h3>
                                    <p className="text-sm text-[#F9F8F4]/60">Last updated: 2 minutes ago</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#2ECC71]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#F39C12]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#E74C3C]"></div>
                                </div>
                            </div>

                            {/* Dashboard Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Soil Moisture Chart */}
                                <div className="bg-[#1A1A1A]/50 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[#F9F8F4] font-medium">Soil Moisture</h4>
                                        <span className="text-[#2ECC71] text-sm">+12%</span>
                                    </div>

                                    {/* Bar Chart */}
                                    <div className="flex items-end justify-between h-32 gap-2">
                                        {[65, 72, 58, 80, 75, 68, 85].map((height, i) => (
                                            <div key={i} className="flex-1 flex flex-col justify-end">
                                                <div
                                                    className="w-full rounded-t-lg bg-gradient-to-t from-[#2ECC71] to-[#27AE60]"
                                                    style={{ height: `${height}%` }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between mt-2 text-xs text-[#F9F8F4]/40">
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                        <span>Fri</span>
                                        <span>Sat</span>
                                        <span>Sun</span>
                                    </div>
                                </div>

                                {/* Market Prices Chart */}
                                <div className="bg-[#1A1A1A]/50 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-[#F9F8F4] font-medium">Market Prices</h4>
                                        <span className="text-[#D4AF37] text-sm">₹2,450/kg</span>
                                    </div>

                                    {/* Line Chart */}
                                    <div className="relative h-32">
                                        <svg className="w-full h-full" viewBox="0 0 280 100" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                                                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <path
                                                d="M 0 80 L 40 65 L 80 70 L 120 45 L 160 50 L 200 30 L 240 35 L 280 20"
                                                fill="none"
                                                stroke="#D4AF37"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M 0 80 L 40 65 L 80 70 L 120 45 L 160 50 L 200 30 L 240 35 L 280 20 L 280 100 L 0 100 Z"
                                                fill="url(#priceGradient)"
                                            />
                                        </svg>
                                    </div>

                                    <div className="flex justify-between mt-2 text-xs text-[#F9F8F4]/40">
                                        <span>Jan</span>
                                        <span>Mar</span>
                                        <span>May</span>
                                        <span>Jul</span>
                                        <span>Sep</span>
                                        <span>Nov</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Footer Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#D4AF37]/20">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#D4AF37] mb-1">156</div>
                                    <div className="text-xs text-[#F9F8F4]/60">Active Sensors</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#2ECC71] mb-1">98.2%</div>
                                    <div className="text-xs text-[#F9F8F4]/60">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[#F39C12] mb-1">24.5k</div>
                                    <div className="text-xs text-[#F9F8F4]/60">Data Points</div>
                                </div>
                            </div>
                        </div>

                        {/* Glow Effect Behind Dashboard */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/20 to-transparent rounded-3xl blur-2xl -z-10 transform translate-y-8"></div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
