/**
 * Financial Overview - Redesigned
 * 
 * User Needs Addressed:
 * 1. Quick financial health assessment at a glance
 * 2. Easy access to loan opportunities
 * 3. Clear transaction history
 * 4. Actionable AI insights
 * 5. Simple eligibility checking
 * 
 * UI/UX Principles:
 * - Visual hierarchy with card-based layout
 * - Progressive disclosure (show important info first)
 * - Consistent spacing and typography
 * - Accessible color contrast
 * - Responsive design
 * - Micro-interactions for engagement
 */

import React, { useState } from 'react';
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    DollarSign,
    CreditCard,
    PieChart,
    Activity,
    CheckCircle,
    AlertCircle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    Shield,
    Target,
    BarChart3,
    Wallet,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FinancialSnapshot from '../FinancialSnapshot';
import EligibilityChecker from '../EligibilityChecker';
import LoanApplicationModal from '../LoanApplicationModal';
import FinanceHistory from '../FinanceHistory';
import { applyForLoan } from '../../../api/financeApi';
import { toast } from 'react-hot-toast';

const FinancialOverview = ({
    snapshotData,
    loans,
    transactions,
    eligibilityData,
    aiInsight,
    loading,
    kpiConfig,
    aiPanelConfig
}) => {
    // UI states
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [checkResult, setCheckResult] = useState(null);
    const [checkingEligibility, setCheckingEligibility] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState('revenue');

    const handleCheckEligibility = async () => {
        setCheckingEligibility(true);
        try {
            const { checkEligibility } = await import('../../../api/financeApi');
            const data = await checkEligibility();
            setCheckResult(data);
            toast.success("Eligibility check complete!");
        } catch (error) {
            toast.error("Failed to check eligibility");
        } finally {
            setCheckingEligibility(false);
        }
    };

    const handleLoanSubmit = async (loanData) => {
        try {
            const response = await applyForLoan(loanData);
            toast.success("Loan application submitted successfully!");
            setIsLoanModalOpen(false);
        } catch (error) {
            toast.error("Failed to submit application");
        }
    };

    const finalEligibility = checkResult || eligibilityData;

    // Calculate financial metrics
    const totalRevenue = snapshotData?.totalRevenue || 0;
    const totalExpenses = snapshotData?.totalExpenses || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
    const cashFlow = snapshotData?.cashFlow || 0;
    const outstandingLoans = loans?.filter(l => l.status === 'active').length || 0;
    const totalLoanAmount = loans?.filter(l => l.status === 'active').reduce((sum, l) => sum + (l.amount || 0), 0) || 0;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Hero Section - Financial Health at a Glance */}
            <motion.div variants={itemVariants} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
                
                <div className="relative px-8 py-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        {/* Left: Main Metrics */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Wallet className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-white/80 text-sm font-medium">Total Balance</p>
                                    <h2 className="text-4xl font-black text-white">
                                        ₹{(totalRevenue - totalExpenses).toLocaleString()}
                                    </h2>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="text-emerald-300" size={16} />
                                        <span className="text-white/70 text-xs font-medium">Revenue</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
                                    <p className="text-emerald-300 text-xs mt-1 flex items-center gap-1">
                                        <ArrowUpRight size={12} />
                                        +12.5% vs last month
                                    </p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown className="text-rose-300" size={16} />
                                        <span className="text-white/70 text-xs font-medium">Expenses</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
                                    <p className="text-rose-300 text-xs mt-1 flex items-center gap-1">
                                        <ArrowDownRight size={12} />
                                        -5.2% vs last month
                                    </p>
                                </div>
                                
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="text-blue-300" size={16} />
                                        <span className="text-white/70 text-xs font-medium">Profit Margin</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{profitMargin}%</p>
                                    <p className="text-blue-300 text-xs mt-1">
                                        {profitMargin > 20 ? 'Excellent' : profitMargin > 10 ? 'Good' : 'Needs attention'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Quick Actions */}
                        <div className="flex flex-col gap-3">
                            {finalEligibility?.isEligible && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsLoanModalOpen(true)}
                                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                                >
                                    <Zap size={20} className="group-hover:rotate-12 transition-transform" />
                                    Quick Loan
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            )}
                            
                            <button
                                onClick={handleCheckEligibility}
                                disabled={checkingEligibility}
                                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold border border-white/30 hover:bg-white/30 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {checkingEligibility ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <Shield size={16} />
                                        Check Eligibility
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* AI Insights - Prominent & Actionable */}
            <motion.div variants={itemVariants}>
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative flex items-start gap-4">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shrink-0"
                        >
                            <Sparkles className="text-white" size={24} />
                        </motion.div>
                        
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    {aiPanelConfig?.title || 'AI Financial Advisor'}
                                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full">
                                        LIVE
                                    </span>
                                </h3>
                                <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors font-semibold">
                                    View Full Analysis
                                </button>
                            </div>
                            
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        <span className="text-slate-300 text-sm">Analyzing your financial data...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-slate-200 text-sm leading-relaxed">
                                            {aiInsight || "Your financial health is strong. Consider diversifying your income streams and maintaining your current expense management strategy."}
                                        </p>
                                        
                                        {/* Quick Recommendations */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-1">
                                                <CheckCircle size={12} />
                                                Cash flow healthy
                                            </span>
                                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full flex items-center gap-1">
                                                <Activity size={12} />
                                                Revenue trending up
                                            </span>
                                            {outstandingLoans > 0 && (
                                                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-full flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {outstandingLoans} active loan{outstandingLoans > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Financial Snapshot - Enhanced KPIs */}
            <motion.div variants={itemVariants}>
                <FinancialSnapshot
                    data={snapshotData}
                    loading={loading}
                    kpiConfig={kpiConfig}
                />
            </motion.div>

            {/* Main Content Grid - Improved Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left: Transaction History - 2/3 width */}
                <motion.div variants={itemVariants} className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <BarChart3 className="text-indigo-600" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Financial Activity</h3>
                                        <p className="text-xs text-slate-500">Recent transactions and loans</p>
                                    </div>
                                </div>
                                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                                    View All
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <FinanceHistory
                                loans={loans}
                                transactions={transactions}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Right: Eligibility & Quick Actions - 1/3 width */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Eligibility Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Shield className="text-emerald-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Loan Eligibility</h3>
                                    <p className="text-xs text-slate-600">Check your approval status</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <EligibilityChecker
                                onCheck={handleCheckEligibility}
                                result={finalEligibility}
                                loading={checkingEligibility}
                            />
                        </div>
                    </div>

                    {/* Quick Loan CTA - Enhanced */}
                    {finalEligibility?.isEligible && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500" />
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQyIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCAwIDEwIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZDIpIi8+PC9zdmc+')] opacity-30" />
                            
                            <div className="relative p-6 rounded-2xl">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Zap className="text-white" size={24} />
                                    </div>
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                                        PRE-APPROVED
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-black text-white mb-2">Instant Microloan</h3>
                                <p className="text-white/90 text-sm mb-1">
                                    Get up to <span className="text-2xl font-black">₹{finalEligibility.maxLoanAmount.toLocaleString()}</span>
                                </p>
                                <p className="text-white/70 text-xs mb-6">
                                    • 5-minute approval • Flexible repayment • Low interest
                                </p>
                                
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsLoanModalOpen(true)}
                                    className="w-full bg-white text-emerald-600 font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                                >
                                    Apply Now
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Financial Tips Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="text-blue-600" size={18} />
                            </div>
                            <h4 className="font-bold text-slate-900">Quick Tips</h4>
                        </div>
                        
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                <span>Maintain 3-6 months of expenses as emergency fund</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                <span>Review and optimize expenses monthly</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                                <span>Diversify income sources for stability</span>
                            </li>
                        </ul>
                    </div>
                </motion.div>
            </div>

            {/* Loan Application Modal */}
            <AnimatePresence>
                {isLoanModalOpen && (
                    <LoanApplicationModal
                        isOpen={isLoanModalOpen}
                        onClose={() => setIsLoanModalOpen(false)}
                        eligibilityData={finalEligibility}
                        onSubmit={handleLoanSubmit}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FinancialOverview;
