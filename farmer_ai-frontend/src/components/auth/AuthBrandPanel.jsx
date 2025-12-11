import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Leaf, BarChart2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthBrandPanel = () => {
    return (
        <div className="hidden lg:flex flex-col justify-between h-full p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0FA36B, #37D99E)' }}>
            {/* Abstract Shapes */}
            <div className="absolute inset-0 opacity-10">
                <svg className="absolute -top-20 -left-20 w-96 h-96" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="currentColor" className="text-white" />
                </svg>
                <svg className="absolute -bottom-32 -right-32 w-[500px] h-[500px]" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="100" fill="currentColor" className="text-white" />
                </svg>
                <svg className="absolute top-1/2 left-1/3 w-64 h-64 -translate-y-1/2" viewBox="0 0 200 200">
                    <path d="M100,10 Q150,50 140,100 T100,190 Q50,150 60,100 T100,10" fill="currentColor" className="text-white" />
                </svg>
            </div>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                    <Sprout size={28} className="text-white" strokeWidth={2} />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">AgriSense</span>
            </Link>

            {/* Content */}
            <div className="relative z-10 space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Intelligent Agriculture,<br />Powered by Data.
                    </h1>
                    <p className="text-white/70 mt-4 text-lg max-w-md">
                        Unlock actionable insights, optimize yields, and make smarter decisions for your farm.
                    </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { icon: Leaf, label: 'Crop Health' },
                        { icon: BarChart2, label: 'Yield Analytics' },
                        { icon: TrendingUp, label: 'Market Insights' },
                        { icon: Sprout, label: 'Soil Intelligence' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3"
                        >
                            <item.icon size={20} className="text-white/80" />
                            <span className="text-white/90 text-sm font-medium">{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <p className="text-white/50 text-sm relative z-10">
                © 2025 AgriSense. All rights reserved.
            </p>
        </div>
    );
};

export default AuthBrandPanel;
