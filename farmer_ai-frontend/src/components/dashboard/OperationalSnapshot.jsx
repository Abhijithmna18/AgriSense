import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Droplets, ShoppingCart, FileText, ChevronRight } from 'lucide-react';

const OperationalSnapshot = ({ data }) => {
    if (!data) return null;

    const getHealthColor = (health) => {
        if (health.includes('Excellent')) return 'text-green-600 dark:text-green-400';
        if (health.includes('Good')) return 'text-emerald-600 dark:text-emerald-400';
        if (health.includes('Fair')) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-stone-200 dark:border-white/10 overflow-hidden mb-8">
            <div className="p-6 border-b border-stone-200 dark:border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-dark-green-text dark:text-warm-ivory">
                    Operational Snapshot
                </h2>
                <button className="text-sm font-medium text-primary-green hover:text-accent-gold transition-colors">
                    View Full Report
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-stone-50 dark:bg-white/5 text-stone-500 dark:text-stone-400 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Crop / Variety</th>
                            <th className="p-4 font-semibold">Growth Stage</th>
                            <th className="p-4 font-semibold">Health Index</th>
                            <th className="p-4 font-semibold">Soil Moisture</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-white/5 text-sm">
                        {data.map((row, idx) => (
                            <motion.tr
                                key={row.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-stone-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <td className="p-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400">
                                        <Sprout size={18} />
                                    </div>
                                    {row.crop}
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">
                                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs font-semibold">
                                        {row.stage}
                                    </span>
                                </td>
                                <td className={`p-4 font-semibold ${getHealthColor(row.health)}`}>
                                    {row.health}
                                </td>
                                <td className="p-4 text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Droplets size={14} className="text-blue-500" />
                                        {row.moisture}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1">
                                        {row.orders !== 'No Active Orders' && (
                                            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                <ShoppingCart size={12} />
                                                {row.orders}
                                            </div>
                                        )}
                                        {row.schemes && (
                                            <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                <FileText size={12} />
                                                {row.schemes}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400">
                                    <ChevronRight size={18} className="group-hover:text-primary-green transition-colors transform group-hover:translate-x-1" />
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OperationalSnapshot;
