
import React, { useState, useMemo } from 'react';
import { FileText, Download, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const FinanceHistory = ({ loans, transactions = [], defaultTab = 'transactions' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Compute dynamic expense categories from transactions
    const expenseCategories = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');
        const aggs = {};
        let total = 0;

        expenses.forEach(t => {
            const cat = t.category || 'Miscellaneous';
            aggs[cat] = (aggs[cat] || 0) + t.amount;
            total += t.amount;
        });

        // Convert to array and take top 5 for visual clarity
        return Object.entries(aggs)
            .map(([name, value]) => ({
                name,
                value,
                percentage: total > 0 ? (value / total) * 100 : 0
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5
    }, [transactions]);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Dynamic colors
    const COLORS = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-cyan-500', 'bg-rose-500'];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header & Tabs */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-slate-800">Financial Activity</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'transactions'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'loans'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Loan Book
                    </button>
                    <button
                        className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-2"
                    >
                        <Download size={14} /> Report
                    </button>
                </div>
            </div>

            <div className="p-6">
                {activeTab === 'transactions' ? (
                    <div className="space-y-8">
                        {/* Expense Breakdown */}
                        {expenseCategories.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Expense Breakdown (Top 5)</h4>
                                <div className="space-y-3">
                                    {expenseCategories.map((cat, idx) => (
                                        <div key={cat.name}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-700 font-medium capitalize">{cat.name.replace('_', ' ')}</span>
                                                <span className="text-slate-500">₹{cat.value.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${COLORS[idx % COLORS.length]}`}
                                                    style={{ width: `${cat.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent Transactions Table */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Transactions</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-semibold">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Date</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {transactions && transactions.length > 0 ? (
                                            transactions.slice(0, 10).map((tx) => (
                                                <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">
                                                        {tx.description || tx.category}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 capitalize">
                                                            {tx.category ? tx.category.replace('_', ' ') : 'General'}
                                                        </span>
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-bold ${tx.type === 'credit' || tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                        {tx.type === 'credit' || tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-slate-400">No transactions recorded</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Loan Tab - Reused existing logic */
                    <div className="space-y-6">
                        {/* Loan Logic Preserved... but we can check if we have loans to determine outstanding logic */}
                        {/* Using the first active loan as "highlight" if available */}
                        {loans && loans.length > 0 ? (
                            <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="relative z-10 flex justify-between items-start">
                                    <div>
                                        <h4 className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Active Loan</h4>
                                        <h3 className="text-2xl font-bold">₹{loans[0].amount.toLocaleString()} <span className="text-sm font-normal text-slate-400">principal</span></h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-300">Status</p>
                                        <p className="font-bold text-emerald-400 capitalize">{loans[0].status}</p>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <p className="text-xs text-indigo-300 flex items-center gap-1">
                                        <CheckCircle size={12} /> Loan active and monitored.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500 border border-slate-200 border-dashed">
                                No active loans found.
                            </div>
                        )}

                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Loans</h4>
                        <div className="grid gap-4">
                            {loans && loans.length > 0 ? (
                                loans.map(loan => (
                                    <div key={loan._id} className="border border-slate-100 rounded-lg p-4 hover:border-slate-300 transition-colors flex justify-between items-center bg-slate-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{loan.purpose || 'Business Loan'}</p>
                                                <p className="text-xs text-slate-500">Disbursed: {loan.disbursedDate ? new Date(loan.disbursedDate).toLocaleDateString() : 'Pending'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-800">₹{loan.amount.toLocaleString()}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${loan.status === 'active' || loan.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {loan.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-400 py-8">No loan history.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinanceHistory;
