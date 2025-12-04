import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color = 'green' }) => {
    const isPositive = trend === 'up';

    const colorMap = {
        green: 'bg-primary-green text-deep-forest',
        gold: 'bg-accent-gold text-white',
        blue: 'bg-blue-500 text-white',
        red: 'bg-red-500 text-white'
    };

    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
            className="glass p-6 rounded-2xl relative overflow-hidden group"
        >
            {/* Background Glow */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150 ${isPositive ? 'bg-primary-green' : 'bg-red-500'}`}></div>

            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.green} shadow-lg shadow-primary-green/20`}>
                    <Icon size={24} />
                </div>
                {trendValue && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-sm font-medium text-dark-green-text/60 dark:text-warm-ivory/60 mb-1">{title}</h3>
                <p className="text-2xl font-bold text-dark-green-text dark:text-warm-ivory font-serif tracking-tight">{value}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;
