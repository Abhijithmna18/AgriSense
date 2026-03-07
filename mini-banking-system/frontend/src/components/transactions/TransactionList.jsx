import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TransactionList = ({ transactions, currentUserId }) => {
    const getTransactionIcon = (transaction) => {
        const isCredit = transaction.to?.user?._id === currentUserId;
        return isCredit ? (
            <ArrowDownLeft className="text-emerald-600" size={20} />
        ) : (
            <ArrowUpRight className="text-rose-600" size={20} />
        );
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="text-emerald-600" size={16} />;
            case 'pending':
                return <Clock className="text-amber-600" size={16} />;
            case 'failed':
                return <XCircle className="text-rose-600" size={16} />;
            default:
                return null;
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-3">
            {transactions.map((transaction, index) => {
                const isCredit = transaction.to?.user?._id === currentUserId;
                const otherParty = isCredit ? transaction.from : transaction.to;

                return (
                    <motion.div
                        key={transaction._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${isCredit ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                    {getTransactionIcon(transaction)}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {isCredit ? 'Received from' : 'Sent to'} {otherParty?.name || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-slate-500">{transaction.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400">{formatDate(transaction.createdAt)}</span>
                                        {getStatusIcon(transaction.status)}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-lg font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isCredit ? '+' : '-'} ₹{transaction.amount.toLocaleString()}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    transaction.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                    transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                    'bg-rose-100 text-rose-700'
                                }`}>
                                    {transaction.status}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default TransactionList;
