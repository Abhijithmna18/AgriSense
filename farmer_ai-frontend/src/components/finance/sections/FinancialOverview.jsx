
import React, { useState } from 'react';
import {
    Sparkles,
    TrendingUp,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
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

    const handleCheckEligibility = async () => {
        setCheckingEligibility(true);
        try {
            const { checkEligibility } = await import('../../../api/financeApi');
            const data = await checkEligibility();
            setCheckResult(data);
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Removed - Now in Parent */}

            {/* AI Insights Panel */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-0.5 shadow-md">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-[10px] p-4 flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                        <Sparkles className="text-indigo-400" size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-indigo-100 font-medium text-sm mb-1">
                            {aiPanelConfig?.title || 'AgriSense AI Insight'}
                        </h4>
                        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono text-xs">
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
                                    Analyzing financial records...
                                </div>
                            ) : (
                                aiInsight || "No specific insights available at this time."
                            )}
                        </div>
                    </div>
                    <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                        View Analysis
                    </button>
                </div>
            </div>

            {/* KPIs & Charts (FinancialSnapshot) */}
            <FinancialSnapshot
                data={snapshotData}
                loading={loading}
                kpiConfig={kpiConfig}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Transactions & History */}
                <div className="lg:col-span-2">
                    <FinanceHistory
                        loans={loans}
                        transactions={transactions}
                    />
                </div>

                {/* Right Col: Eligibility & Actions */}
                <div className="space-y-6">
                    <EligibilityChecker
                        onCheck={handleCheckEligibility}
                        result={finalEligibility}
                        loading={checkingEligibility}
                    />

                    {/* Quick Loan CTA */}
                    {finalEligibility?.isEligible && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform" />
                            <h3 className="text-lg font-bold text-slate-800 mb-2 relative z-10">Instant Microloan</h3>
                            <p className="text-slate-500 text-sm mb-6 relative z-10">
                                Pre-approved for <span className="text-emerald-600 font-bold">₹{finalEligibility.maxLoanAmount.toLocaleString()}</span>.
                                Disbursal in 5 mins.
                            </p>
                            <button
                                onClick={() => setIsLoanModalOpen(true)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-2 relative z-10"
                            >
                                Apply Now <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <LoanApplicationModal
                isOpen={isLoanModalOpen}
                onClose={() => setIsLoanModalOpen(false)}
                eligibilityData={finalEligibility}
                onSubmit={handleLoanSubmit}
            />
        </div>
    );
};

export default FinancialOverview;
