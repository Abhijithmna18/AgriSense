import React from 'react';
import { CreditCard, Landmark, FileCheck, CircleDollarSign } from 'lucide-react';

const FinanceSchemes = ({ data }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Credit Score Card */}
            <div className="md:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-100 dark:border-emerald-800/30 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm mb-4">
                    <CreditCard size={32} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest text-xs mb-1">Credit Score</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{data.creditScore}</p>
                <div className="text-xs px-2 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 rounded">
                    Excellent
                </div>
                <p className="text-xs text-gray-400 mt-4">Updated: Today</p>
            </div>

            {/* Active Loans & Schemes */}
            <div className="md:col-span-2 space-y-6">

                {/* Loans */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CircleDollarSign size={16} /> Active Loans
                    </h3>
                    {data.loans.map(loan => (
                        <div key={loan.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-stone-200 dark:border-white/10 flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-lg">
                                    <Landmark size={20} className="text-stone-600 dark:text-stone-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{loan.provider}</p>
                                    <p className="text-xs text-gray-500">Next EMI: {loan.nextEmi}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-bold text-gray-900 dark:text-white">{loan.amount}</p>
                                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{loan.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Schemes */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileCheck size={16} /> Eligible Schemes
                    </h3>
                    {data.schemes.map(scheme => (
                        <div key={scheme.id} className="bg-white dark:bg-white/5 p-4 rounded-xl border border-stone-200 dark:border-white/10 flex justify-between items-center mb-3 hover:border-accent-gold/50 transition-colors cursor-pointer">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{scheme.name}</p>
                                <p className="text-xs text-accent-gold dark:text-accent-gold/80 font-medium">Benefit: {scheme.benefit}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Apply by</p>
                                <p className="text-sm font-medium text-red-500">{scheme.deadline}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default FinanceSchemes;
