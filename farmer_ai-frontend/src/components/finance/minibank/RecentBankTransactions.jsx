import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

const RecentBankTransactions = ({ transactions = [] }) => {
    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
            <h4 className="font-bold text-slate-900 mb-4">Recent Transactions</h4>
            
            {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No recent transactions</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map((tx, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {tx.type === 'credit' ? (
                                        <ArrowDownLeft className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                                    )}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">{tx.description || 'Transaction'}</div>
                                    <div className="text-xs text-slate-500">{tx.date || 'Today'}</div>
                                </div>
                            </div>
                            <div className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN') || '0'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentBankTransactions;
