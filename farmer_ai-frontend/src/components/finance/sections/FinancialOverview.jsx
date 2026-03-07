
import React, { useState, useEffect } from 'react';
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

// Mini Bank Components
import MiniBankWallet from '../minibank/MiniBankWallet';
import QuickBankingActions from '../minibank/QuickBankingActions';
import RecentBankTransactions from '../minibank/RecentBankTransactions';
import UpcomingBills from '../minibank/UpcomingBills';
import SavingsGoalsWidget from '../minibank/SavingsGoalsWidget';
import FixedDepositsSummary from '../minibank/FixedDepositsSummary';
import VirtualCardDisplay from '../minibank/VirtualCardDisplay';
import SendMoneyModal from '../minibank/SendMoneyModal';
import RequestPaymentModal from '../minibank/RequestPaymentModal';
import ScanQRModal from '../minibank/ScanQRModal';
import CreateSavingsGoalModal from '../minibank/CreateSavingsGoalModal';
import AddContributionModal from '../minibank/AddContributionModal';
import CreateFixedDepositModal from '../minibank/CreateFixedDepositModal';
import SetCardLimitModal from '../minibank/SetCardLimitModal';

// Mini Bank API
import * as miniBankApi from '../../../api/miniBankApi';

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
    const [isSendMoneyModalOpen, setIsSendMoneyModalOpen] = useState(false);
    const [isRequestPaymentModalOpen, setIsRequestPaymentModalOpen] = useState(false);
    const [isScanQRModalOpen, setIsScanQRModalOpen] = useState(false);
    const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);
    const [isAddContributionModalOpen, setIsAddContributionModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [isCreateFDModalOpen, setIsCreateFDModalOpen] = useState(false);
    const [isSetCardLimitModalOpen, setIsSetCardLimitModalOpen] = useState(false);

    // Mini Bank States
    const [walletData, setWalletData] = useState(null);
    const [bankTransactions, setBankTransactions] = useState([]);
    const [upcomingBills, setUpcomingBills] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [fixedDeposits, setFixedDeposits] = useState([]);
    const [virtualCard, setVirtualCard] = useState(null);
    const [miniBankLoading, setMiniBankLoading] = useState(true);

    // Fetch Mini Bank Data
    useEffect(() => {
        const fetchMiniBankData = async () => {
            setMiniBankLoading(true);
            try {
                const [wallet, txs, bills, goals, fds, card] = await Promise.all([
                    miniBankApi.getWalletBalance().catch(() => ({ balance: 125000, accountNumber: '1234567890', ifscCode: 'AGRI0001234' })),
                    miniBankApi.getRecentTransactions(5).catch(() => []),
                    miniBankApi.getUpcomingBills().catch(() => []),
                    miniBankApi.getSavingsGoals().catch(() => []),
                    miniBankApi.getActiveFDs().catch(() => []),
                    miniBankApi.getVirtualCard().catch(() => null)
                ]);

                setWalletData(wallet);
                setBankTransactions(txs);
                setUpcomingBills(bills);
                setSavingsGoals(goals);
                setFixedDeposits(fds);
                setVirtualCard(card);
            } catch (error) {
                console.error('Failed to load Mini Bank data:', error);
            } finally {
                setMiniBankLoading(false);
            }
        };

        fetchMiniBankData();
    }, []);

    // Mini Bank Handlers
    const handleRefreshWallet = async () => {
        try {
            const wallet = await miniBankApi.getWalletBalance();
            setWalletData(wallet);
            toast.success('Wallet refreshed');
        } catch (error) {
            toast.error('Failed to refresh wallet');
        }
    };

    const handleSendMoney = () => {
        setIsSendMoneyModalOpen(true);
    };

    const handleSendMoneySubmit = async (formData) => {
        try {
            await miniBankApi.sendMoney(formData.receiverId, formData.amount, formData.description);
            toast.success(`₹${formData.amount} sent successfully!`);
            
            // Refresh wallet and transactions
            const [wallet, txs] = await Promise.all([
                miniBankApi.getWalletBalance(),
                miniBankApi.getRecentTransactions(5)
            ]);
            setWalletData(wallet);
            setBankTransactions(txs);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to send money');
        }
    };

    const handleRequestPayment = () => {
        setIsRequestPaymentModalOpen(true);
    };

    const handleRequestPaymentSubmit = async (formData) => {
        try {
            await miniBankApi.requestPayment(formData.fromUserId, formData.amount, formData.description);
            toast.success('Payment request sent successfully!');
            
            // Optionally refresh transactions
            const txs = await miniBankApi.getRecentTransactions(5);
            setBankTransactions(txs);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to request payment');
        }
    };

    const handleScanQR = () => {
        setIsScanQRModalOpen(true);
    };

    const handleScanQRSubmit = async (paymentData) => {
        try {
            await miniBankApi.processQRPayment(paymentData.qrData);
            toast.success(`₹${paymentData.amount} paid successfully via QR!`);
            
            // Refresh wallet and transactions
            const [wallet, txs] = await Promise.all([
                miniBankApi.getWalletBalance(),
                miniBankApi.getRecentTransactions(5)
            ]);
            setWalletData(wallet);
            setBankTransactions(txs);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to process QR payment');
        }
    };

    const handlePayBills = () => {
        toast('Pay Bills feature - Coming soon!', { icon: '💳' });
    };

    const handlePayBill = async (bill) => {
        try {
            await miniBankApi.payBill(bill.id);
            toast.success(`${bill.provider} bill paid successfully!`);
            // Refresh data
            const [wallet, bills] = await Promise.all([
                miniBankApi.getWalletBalance(),
                miniBankApi.getUpcomingBills()
            ]);
            setWalletData(wallet);
            setUpcomingBills(bills);
        } catch (error) {
            toast.error(error.message || 'Failed to pay bill');
        }
    };

    const handleAddContribution = async (goal) => {
        console.log('Opening contribution modal for goal:', goal);
        setSelectedGoal(goal);
        setIsAddContributionModalOpen(true);
    };

    const handleAddContributionSubmit = async (goal, amount) => {
        try {
            console.log('Adding contribution:', { goalId: goal.id, amount });
            await miniBankApi.addSavingsContribution(goal.id, amount);
            toast.success(`₹${amount} added to ${goal.name}!`);
            
            // Refresh savings goals
            const goals = await miniBankApi.getSavingsGoals();
            setSavingsGoals(goals);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to add contribution');
        }
    };

    const handleCreateGoal = () => {
        setIsCreateGoalModalOpen(true);
    };

    const handleCreateGoalSubmit = async (goalData) => {
        try {
            await miniBankApi.createSavingsGoal(goalData);
            toast.success('Savings goal created successfully!');
            
            // Refresh savings goals
            const goals = await miniBankApi.getSavingsGoals();
            setSavingsGoals(goals);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create savings goal');
        }
    };

    const handleCreateFD = () => {
        setIsCreateFDModalOpen(true);
    };

    const handleCreateFDSubmit = async (fdData) => {
        try {
            await miniBankApi.createFixedDeposit(fdData);
            toast.success(`Fixed Deposit of ₹${fdData.amount.toLocaleString('en-IN')} created successfully!`);
            
            // Refresh wallet and FDs
            const [wallet, fds] = await Promise.all([
                miniBankApi.getWalletBalance(),
                miniBankApi.getActiveFDs()
            ]);
            setWalletData(wallet);
            setFixedDeposits(fds);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create fixed deposit');
        }
    };

    const handleFreezeCard = async (cardId) => {
        try {
            const card = await miniBankApi.freezeCard(cardId);
            setVirtualCard(card);
            toast.success(card.status === 'frozen' ? 'Card frozen successfully' : 'Card unfrozen successfully');
        } catch (error) {
            toast.error('Failed to update card status');
        }
    };

    const handleSetLimit = (cardId) => {
        setIsSetCardLimitModalOpen(true);
    };

    const handleSetLimitSubmit = async (newLimit) => {
        try {
            if (!virtualCard) return;
            
            const card = await miniBankApi.setCardLimit(virtualCard.id, newLimit);
            setVirtualCard(card);
            toast.success(`Card limit updated to ₹${newLimit.toLocaleString('en-IN')}`);
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to set card limit');
        }
    };

    const handleGenerateCard = async () => {
        try {
            const card = await miniBankApi.generateVirtualCard();
            setVirtualCard(card);
            toast.success('Virtual card generated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate card');
        }
    };

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

            {/* Enhanced AI Insights Panel with Green Theme */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-0.5 shadow-xl shadow-emerald-200/50">
                <div className="bg-gradient-to-br from-emerald-900/95 to-green-900/95 backdrop-blur-sm rounded-[14px] p-6 flex items-start gap-4">
                    <div className="p-3 bg-emerald-400/20 rounded-xl shrink-0 shadow-inner">
                        <Sparkles className="text-emerald-300" size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-emerald-100 font-bold text-base mb-2 flex items-center gap-2">
                            {aiPanelConfig?.title || 'AgriSense AI Insight'}
                            <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                        </h4>
                        <div className="text-emerald-50/90 text-sm leading-relaxed whitespace-pre-wrap">
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                    <span className="ml-2">Analyzing financial records...</span>
                                </div>
                            ) : (
                                aiInsight || "No specific insights available at this time."
                            )}
                        </div>
                    </div>
                    <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all hover:scale-105 font-semibold border border-white/10">
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

            {/* Mini Bank Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900">Mini Bank</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
                        Digital Banking
                    </span>
                </div>

                {/* Wallet & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <MiniBankWallet 
                            walletData={walletData} 
                            onRefresh={handleRefreshWallet}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                            <h4 className="font-bold text-slate-900 mb-4">Quick Actions</h4>
                            <QuickBankingActions
                                onSendMoney={handleSendMoney}
                                onRequestPayment={handleRequestPayment}
                                onScanQR={handleScanQR}
                                onPayBills={handlePayBills}
                            />
                        </div>
                    </div>
                </div>

                {/* Transactions & Bills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentBankTransactions transactions={bankTransactions} />
                    <UpcomingBills bills={upcomingBills} onPayBill={handlePayBill} />
                </div>

                {/* Savings & Investments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SavingsGoalsWidget
                        goals={savingsGoals}
                        onAddContribution={handleAddContribution}
                        onCreateGoal={handleCreateGoal}
                    />
                    <FixedDepositsSummary
                        deposits={fixedDeposits}
                        onCreateFD={handleCreateFD}
                    />
                </div>

                {/* Virtual Card */}
                <div className="max-w-md">
                    <VirtualCardDisplay
                        card={virtualCard}
                        onFreeze={handleFreezeCard}
                        onSetLimit={handleSetLimit}
                        onGenerate={handleGenerateCard}
                    />
                </div>
            </div>

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

                    {/* Enhanced Quick Loan CTA with Green Theme */}
                    {finalEligibility?.isEligible && (
                        <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-2xl shadow-lg shadow-emerald-200/50 border-2 border-emerald-200/60 p-6 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-300/50 transition-all">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-200/40 to-green-300/30 rounded-full translate-x-16 -translate-y-16 group-hover:scale-125 transition-transform duration-500" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-lime-200/30 to-teal-200/30 rounded-full -translate-x-12 translate-y-12 group-hover:scale-125 transition-transform duration-500" />
                            
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    PRE-APPROVED
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2">Instant Microloan</h3>
                                <p className="text-slate-600 text-sm mb-4">
                                    Pre-approved for <span className="text-emerald-600 font-black text-lg">₹{finalEligibility.maxLoanAmount.toLocaleString()}</span>.
                                </p>
                                <div className="flex items-center gap-2 text-xs text-emerald-700 mb-6">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span>5 min disbursal</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span>No collateral</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsLoanModalOpen(true)}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-300/50 transition-all flex items-center justify-center gap-2 hover:scale-105"
                                >
                                    Apply Now <ChevronRight size={18} />
                                </button>
                            </div>
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
            
            <SendMoneyModal
                isOpen={isSendMoneyModalOpen}
                onClose={() => setIsSendMoneyModalOpen(false)}
                onSend={handleSendMoneySubmit}
                walletBalance={walletData?.balance || 0}
            />
            
            <RequestPaymentModal
                isOpen={isRequestPaymentModalOpen}
                onClose={() => setIsRequestPaymentModalOpen(false)}
                onRequest={handleRequestPaymentSubmit}
            />
            
            <ScanQRModal
                isOpen={isScanQRModalOpen}
                onClose={() => setIsScanQRModalOpen(false)}
                onScan={handleScanQRSubmit}
                walletBalance={walletData?.balance || 0}
            />
            
            <CreateSavingsGoalModal
                isOpen={isCreateGoalModalOpen}
                onClose={() => setIsCreateGoalModalOpen(false)}
                onCreate={handleCreateGoalSubmit}
                walletBalance={walletData?.balance || 0}
            />
            
            <AddContributionModal
                isOpen={isAddContributionModalOpen}
                onClose={() => {
                    setIsAddContributionModalOpen(false);
                    setSelectedGoal(null);
                }}
                onAdd={handleAddContributionSubmit}
                goal={selectedGoal}
                walletBalance={walletData?.balance || 0}
            />
            
            <CreateFixedDepositModal
                isOpen={isCreateFDModalOpen}
                onClose={() => setIsCreateFDModalOpen(false)}
                onCreate={handleCreateFDSubmit}
                walletBalance={walletData?.balance || 0}
            />
            
            <SetCardLimitModal
                isOpen={isSetCardLimitModalOpen}
                onClose={() => setIsSetCardLimitModalOpen(false)}
                onSetLimit={handleSetLimitSubmit}
                currentLimit={virtualCard?.limit}
                walletBalance={walletData?.balance || 0}
            />
        </div>
    );
};

export default FinancialOverview;
