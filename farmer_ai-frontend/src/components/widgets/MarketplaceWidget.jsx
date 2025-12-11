import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, TrendingUp, Package, DollarSign } from 'lucide-react';
import WidgetWrapper from '../dashboard/WidgetWrapper';

const MarketplaceWidget = ({ onRemove, onMinimize }) => {
    const transactions = [
        { id: 1, buyer: 'FreshMart Co.', product: 'Organic Wheat', qty: '500 kg', amount: '$2,450', status: 'completed' },
        { id: 2, buyer: 'GreenGrocer Ltd', product: 'Tomatoes', qty: '200 kg', amount: '$890', status: 'pending' },
        { id: 3, buyer: 'AgriExport Inc', product: 'Rice', qty: '1000 kg', amount: '$4,200', status: 'processing' }
    ];

    const stats = [
        { label: 'Today\'s Orders', value: '12', icon: Package, color: 'text-blue-500' },
        { label: 'Revenue', value: '$8.5K', icon: DollarSign, color: 'text-primary-green' },
        { label: 'Growth', value: '+23%', icon: TrendingUp, color: 'text-accent-gold' }
    ];

    return (
        <WidgetWrapper
            title="Marketplace Transactions"
            onRemove={onRemove}
            onMinimize={onMinimize}
            actions={
                <button className="text-xs text-accent-gold hover:underline">View All</button>
            }
        >
            <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center p-3 bg-white/5 rounded-lg">
                            <stat.icon size={16} className={`mx-auto mb-1 ${stat.color}`} />
                            <div className="text-lg font-bold text-dark-green-text dark:text-warm-ivory">{stat.value}</div>
                            <div className="text-[10px] text-dark-green-text/50">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Transaction List */}
                <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-dark-green-text/70 uppercase tracking-wider">Recent Transactions</h5>
                    {transactions.map((txn) => (
                        <motion.div
                            key={txn.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="text-sm font-medium text-dark-green-text dark:text-warm-ivory">{txn.buyer}</div>
                                <div className="text-xs text-dark-green-text/60">{txn.product} • {txn.qty}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-primary-green">{txn.amount}</div>
                                <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block ${txn.status === 'completed' ? 'bg-green-500/20 text-green-600' :
                                    txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                                        'bg-blue-500/20 text-blue-600'
                                    }`}>
                                    {txn.status}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default MarketplaceWidget;
