import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import WidgetWrapper from '../dashboard/WidgetWrapper';

const GovernmentSchemesWidget = ({ onRemove, onMinimize }) => {
    const schemes = [
        {
            id: 1,
            name: 'PM-KISAN Direct Benefit',
            status: 'eligible',
            amount: '$600/year',
            deadline: '15 days left',
            icon: CheckCircle,
            color: 'text-green-500'
        },
        {
            id: 2,
            name: 'Soil Health Card Scheme',
            status: 'applied',
            amount: 'Free',
            deadline: 'Under review',
            icon: Clock,
            color: 'text-yellow-500'
        },
        {
            id: 3,
            name: 'Crop Insurance (PMFBY)',
            status: 'action_required',
            amount: 'Subsidized',
            deadline: '3 days left',
            icon: AlertCircle,
            color: 'text-red-500'
        }
    ];

    return (
        <WidgetWrapper
            title="Government Schemes"
            onRemove={onRemove}
            onMinimize={onMinimize}
            actions={
                <span className="text-xs text-accent-gold">3 Available</span>
            }
        >
            <div className="space-y-3">
                {schemes.map((scheme, index) => (
                    <motion.div
                        key={scheme.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-accent-gold/30 transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-white/5 ${scheme.color}`}>
                                <scheme.icon size={16} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-dark-green-text dark:text-warm-ivory mb-1">
                                    {scheme.name}
                                </h4>
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-primary-green font-medium">{scheme.amount}</span>
                                    <span className="text-dark-green-text/50">{scheme.deadline}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${scheme.status === 'eligible' ? 'bg-green-500/20 text-green-600' :
                                        scheme.status === 'applied' ? 'bg-yellow-500/20 text-yellow-600' :
                                            'bg-red-500/20 text-red-600'
                                        }`}>
                                        {scheme.status.replace('_', ' ')}
                                    </span>
                                    {scheme.status === 'eligible' && (
                                        <button className="text-[10px] text-accent-gold hover:underline">Apply Now</button>
                                    )}
                                    {scheme.status === 'action_required' && (
                                        <button className="text-[10px] text-red-500 hover:underline">Complete Application</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                <button className="w-full py-2 text-xs text-accent-gold hover:bg-white/5 rounded-lg transition-colors border border-accent-gold/20">
                    Browse All Schemes
                </button>
            </div>
        </WidgetWrapper>
    );
};

export default GovernmentSchemesWidget;
