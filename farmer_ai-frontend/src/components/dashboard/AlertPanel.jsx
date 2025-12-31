import React from 'react';
import { AlertTriangle, Droplets, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertPanel = ({ alerts }) => {
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="text-red-500 animate-pulse" size={24} />
                <h2 className="text-xl font-serif font-bold text-dark-green-text dark:text-warm-ivory">
                    Critical Agronomic Alerts
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {alerts.map((alert, index) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
              relative overflow-hidden rounded-xl border-l-4 p-5 shadow-sm transition-all hover:shadow-md
              ${alert.severity === 'high'
                                ? 'bg-red-50/80 border-red-500 dark:bg-red-900/20'
                                : 'bg-orange-50/80 border-orange-400 dark:bg-orange-900/20'
                            }
            `}
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                            {/* Alert Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`
                    text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                    ${alert.severity === 'high'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                                        }
                  `}>
                                        {alert.type}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {new Date(alert.date).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                                    {alert.title}
                                </h3>

                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    {alert.message}
                                </p>

                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <div className="text-red-600 dark:text-red-400">
                                        Impact: {alert.impact}
                                    </div>
                                    <div className="text-gray-500 dark:text-gray-400">
                                        Confidence: {alert.confidence}%
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="shrink-0">
                                <button className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-sm transition-transform active:scale-95
                  ${alert.severity === 'high'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-orange-500 hover:bg-orange-600'
                                    }
                `}>
                                    <span>{alert.action}</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AlertPanel;
