import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Wallet, 
    ArrowLeftRight, 
    Receipt, 
    Target, 
    TrendingUp, 
    CreditCard,
    Bell,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { walletAPI, transactionAPI, billAPI, savingsAPI } from '../services/bankingApi';
import WalletCard from '../components/banking/wallet/WalletCard';
import TransactionList from '../components/banking/transactions/TransactionList';
import { toast } from 'react-hot-toast';

const BankingDashboard = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [upcomingBills, setUpcomingBills] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [walletRes, txRes, billsRes, goalsRes] = await Promise.all([
                walletAPI.getWallet(),
                transactionAPI.getTransactions({ limit: 5 }),
                billAPI.getUpcomingBills(),
                savingsAPI.getGoals({ status: 'active' })
            ]);

            setWallet(walletRes.data.data);
            setTransactions(txRes.data.data.transactions);
            setUpcomingBills(billsRes.data.data);
            setSavingsGoals(goalsRes.data.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            toast.error('Failed to load banking data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadDashboardData();
        toast.success('Dashboard refreshed');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-green-50/20 to-lime-50/30 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        Banking Dashboard
                    </h1>
                    <p className="text-slate-600">Manage your finances in one place</p>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Wallet Card - Spans 2 columns */}
                    <div className="lg:col-span-2">
                        <WalletCard 
                            wallet={wallet} 
                            onRefresh={handleRefresh}
                            onDeposit={() => {/* Open deposit modal */}}
                            onWithdraw={() => {/* Open withdraw modal */}}
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
                        <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to="/banking/send-money" className="flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                                <ArrowLeftRight className="text-emerald-600" size={20} />
                                <span className="font-semibold text-slate-900">Send Money</span>
                            </Link>
                            <Link to="/banking/bills" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                                <Receipt className="text-blue-600" size={20} />
                                <span className="font-semibold text-slate-900">Pay Bills</span>
                            </Link>
                            <Link to="/banking/savings" className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                                <Target className="text-purple-600" size={20} />
                                <span className="font-semibold text-slate-900">Savings Goals</span>
                            </Link>
                            <Link to="/banking/fixed-deposits" className="flex items-center gap-3 p-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors">
                                <TrendingUp className="text-amber-600" size={20} />
                                <span className="font-semibold text-slate-900">Fixed Deposits</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions & Upcoming Bills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Transactions */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Recent Transactions</h3>
                            <Link to="/banking/transactions" className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold">
                                View All
                            </Link>
                        </div>
                        {transactions.length > 0 ? (
                            <TransactionList transactions={transactions} currentUserId={wallet?.user?._id} />
                        ) : (
                            <p className="text-slate-500 text-center py-8">No transactions yet</p>
                        )}
                    </div>

                    {/* Upcoming Bills */}
                    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900">Upcoming Bills</h3>
                            <Link to="/banking/bills" className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold">
                                View All
                            </Link>
                        </div>
                        {upcomingBills.length > 0 ? (
                            <div className="space-y-3">
                                {upcomingBills.map(bill => (
                                    <div key={bill._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-semibold text-slate-900">{bill.provider}</p>
                                            <p className="text-xs text-slate-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                                        </div>
                                        <p className="font-bold text-rose-600">₹{bill.amount.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">No upcoming bills</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BankingDashboard;
