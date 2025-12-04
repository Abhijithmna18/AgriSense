import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, Calendar, TrendingUp } from 'lucide-react';
import WidgetWrapper from '../dashboard/WidgetWrapper';

const FinancialWidget = ({ onRemove, onMinimize }) => {
    const loans = [
        { id: 1, type: 'Crop Loan', amount: '$15,000', disbursed: '$10,000', nextPayment: 'Jan 15', status: 'active' },
        { id: 2, type: 'Equipment Loan', amount: '$25,000', disbursed: '$25,000', nextPayment: 'Jan 20', status: 'active' }
    ];

    const creditScore = 742;

    return (
        <WidgetWrapper
            title="Financial Overview"
            onRemove={onRemove}
            onMinimize={onMinimize}
            actions={
                <Wallet size={14} className="text-accent-gold" />
            }
        >
            <div className="space-y-4">
                {/* Credit Score */}
                <div className="p-4 bg-gradient-to-br from-accent-gold/10 to-primary-green/10 rounded-xl border border-accent-gold/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-dark-green-text/60">Credit Score</span>
                        <TrendingUp size={14} className="text-green-500" />
                    </div>
                    <div className="text-3xl font-bold font-serif text-dark-green-text dark:text-warm-ivory">{creditScore}</div>
                    <div className="text-xs text-dark-green-text/50 mt-1">Excellent • Eligible for premium loans</div>
                </div>

                {/* Active Loans */}
                <div>
                    <h5 className="text-xs font-semibold text-dark-green-text/70 uppercase tracking-wider mb-2">Active Loans</h5>
                    <div className="space-y-2">
                        {loans.map((loan) => (
                            <motion.div
                                key={loan.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-white/5 rounded-lg border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={14} className="text-accent-gold" />
                                        <span className="text-sm font-medium text-dark-green-text dark:text-warm-ivory">{loan.type}</span>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-600 rounded-full">{loan.status}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <div className="text-dark-green-text/50">Total</div>
                                        <div className="font-semibold text-dark-green-text dark:text-warm-ivory">{loan.amount}</div>
                                    </div>
                                    <div>
                                        <div className="text-dark-green-text/50">Disbursed</div>
                                        <div className="font-semibold text-primary-green">{loan.disbursed}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-xs text-dark-green-text/60">
                                    <Calendar size={12} />
                                    <span>Next payment: {loan.nextPayment}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Quick Action */}
                <button className="w-full py-2 px-4 bg-accent-gold/10 hover:bg-accent-gold/20 border border-accent-gold/30 rounded-lg text-sm font-medium text-accent-gold transition-colors">
                    Apply for New Loan
                </button>
            </div>
        </WidgetWrapper>
    );
};

export default FinancialWidget;
