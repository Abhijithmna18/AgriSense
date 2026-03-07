import React, { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const WalletCard = ({ wallet, onDeposit, onWithdraw, onRefresh }) => {
    const [showBalance, setShowBalance] = useState(true);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-200/50 relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wider">
                            Wallet Balance
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <h2 className="text-4xl font-black">
                                {showBalance ? formatCurrency(wallet?.balance || 0) : '₹ ••••••'}
                            </h2>
                            <button
                                onClick={() => setShowBalance(!showBalance)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all hover:rotate-180 duration-500"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-emerald-100 text-xs mb-1">Account Number</p>
                        <p className="font-bold text-sm">{wallet?.user?.accountNumber || '••••••••••••'}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-emerald-100 text-xs mb-1">IFSC Code</p>
                        <p className="font-bold text-sm">{wallet?.user?.ifscCode || 'MINI0001234'}</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onDeposit}
                        className="bg-white text-emerald-600 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                    >
                        <ArrowDownLeft size={18} />
                        Deposit
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onWithdraw}
                        className="bg-white/10 backdrop-blur-sm border-2 border-white/30 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                    >
                        <ArrowUpRight size={18} />
                        Withdraw
                    </motion.button>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-emerald-100 text-xs mb-1">Total Deposits</p>
                        <p className="font-bold">{formatCurrency(wallet?.totalDeposits || 0)}</p>
                    </div>
                    <div>
                        <p className="text-emerald-100 text-xs mb-1">Total Withdrawals</p>
                        <p className="font-bold">{formatCurrency(wallet?.totalWithdrawals || 0)}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default WalletCard;
