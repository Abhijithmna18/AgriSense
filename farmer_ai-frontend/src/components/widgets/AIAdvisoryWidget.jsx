import React from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import WidgetWrapper from '../dashboard/WidgetWrapper';

const AIAdvisoryWidget = ({ onRemove, onMinimize }) => {
    const insights = [
        {
            id: 1,
            type: 'critical',
            title: 'Pest Risk Alert',
            description: 'High probability of aphid infestation detected in wheat fields (Block A3)',
            confidence: 94,
            action: 'Apply neem-based pesticide',
            icon: AlertTriangle,
            color: 'text-red-500'
        },
        {
            id: 2,
            type: 'recommendation',
            title: 'Optimal Harvest Window',
            description: 'Weather conditions favorable for harvesting in next 72 hours',
            confidence: 89,
            action: 'Schedule harvest crew',
            icon: TrendingUp,
            color: 'text-primary-green'
        },
        {
            id: 3,
            type: 'success',
            title: 'Irrigation Optimized',
            description: 'AI-adjusted irrigation schedule saved 15% water this week',
            confidence: 97,
            action: 'View details',
            icon: CheckCircle,
            color: 'text-blue-500'
        }
    ];

    return (
        <WidgetWrapper
            title="AI Advisory Engine"
            onRemove={onRemove}
            onMinimize={onMinimize}
            actions={
                <div className="flex items-center gap-2 text-xs text-dark-green-text/50">
                    <Brain size={14} className="text-accent-gold" />
                    <span>Live</span>
                </div>
            }
        >
            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-accent-gold/30 transition-all group"
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-white/5 ${insight.color}`}>
                                <insight.icon size={18} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-sm text-dark-green-text dark:text-warm-ivory">
                                        {insight.title}
                                    </h4>
                                    <span className="text-xs text-dark-green-text/50">
                                        {insight.confidence}% confidence
                                    </span>
                                </div>
                                <p className="text-xs text-dark-green-text/70 dark:text-warm-ivory/70 mb-3">
                                    {insight.description}
                                </p>
                                <button className="flex items-center gap-2 text-xs font-medium text-accent-gold hover:gap-3 transition-all">
                                    {insight.action}
                                    <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </WidgetWrapper>
    );
};

export default AIAdvisoryWidget;
