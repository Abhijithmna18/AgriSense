import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FinancialSnapshot from '../components/finance/FinancialSnapshot';
import EligibilityChecker from '../components/finance/EligibilityChecker';
import LoanApplicationModal from '../components/finance/LoanApplicationModal';
import FinanceHistory from '../components/finance/FinanceHistory';
import { getFinancialSnapshot, checkEligibility, applyForLoan, getLoans, getTransactions } from '../api/financeApi';
import { toast } from 'react-hot-toast';

const FinancialServicesPage = () => {
    // State
    const [snapshotData, setSnapshotData] = useState(null);
    const [loans, setLoans] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [eligibilityData, setEligibilityData] = useState(null);

    // Loading states
    const [loadingSnapshot, setLoadingSnapshot] = useState(true);
    const [checkingEligibility, setCheckingEligibility] = useState(false);

    // UI states
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoadingSnapshot(true);
        try {
            const [snapshot, loansData, txData] = await Promise.all([
                getFinancialSnapshot(),
                getLoans(),
                getTransactions()
            ]);
            setSnapshotData(snapshot);
            setLoans(loansData);
            setTransactions(txData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load financial data");
        } finally {
            setLoadingSnapshot(false);
        }
    };

    const handleCheckEligibility = async () => {
        setCheckingEligibility(true);
        try {
            const data = await checkEligibility();
            setEligibilityData(data);
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
            // Refresh data
            fetchDashboardData();
        } catch (error) {
            toast.error("Failed to submit application");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <nav className="text-sm font-medium text-gray-500 mb-1">
                            <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link> &gt; <span className="text-gray-900">Financial Services</span>
                        </nav>
                        <h1 className="text-3xl font-extrabold text-gray-900">Financial Services</h1>
                        <p className="text-gray-500 mt-1">Manage cashflow, loans, and check eligibility.</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        {/* Actions if needed */}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Snapshot & History (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">
                        <FinancialSnapshot
                            data={snapshotData}
                            loading={loadingSnapshot}
                        />

                        <FinanceHistory
                            loans={loans}
                            transactions={transactions}
                        />
                    </div>

                    {/* Right Column: Key Actions (1/3 width) */}
                    <div className="space-y-8">

                        {/* Eligibility & Loan Card */}
                        <EligibilityChecker
                            onCheck={handleCheckEligibility}
                            result={eligibilityData}
                            loading={checkingEligibility}
                        />

                        {/* If eligible, show Apply button CTA specifically if they haven't clicked check yet but might know, 
                            OR if they checked and are eligible. 
                            Actually, the EligibilityChecker handles the result view, but we need a way to open the modal.
                        */}
                        {eligibilityData?.isEligible && (
                            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl shadow-lg p-6 text-white text-center">
                                <h3 className="text-xl font-bold mb-2">Pre-approved for Microloan</h3>
                                <p className="text-green-100 text-sm mb-6">Based on your score, you can avail up to ₹{eligibilityData.maxLoanAmount.toLocaleString()} instantly.</p>
                                <button
                                    onClick={() => setIsLoanModalOpen(true)}
                                    className="bg-white text-green-700 font-bold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 transition-colors w-full"
                                >
                                    Apply Now
                                </button>
                            </div>
                        )}

                        {/* Helper / Tips */}
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="font-bold text-blue-800 mb-2">Financial Tips</h4>
                            <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                                <li>Maintain a healthy cashflow balance.</li>
                                <li>Repay EMIs on time to boost your score.</li>
                                <li>Record all farm expenses accurately.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <LoanApplicationModal
                isOpen={isLoanModalOpen}
                onClose={() => setIsLoanModalOpen(false)}
                eligibilityData={eligibilityData}
                onSubmit={handleLoanSubmit}
            />
        </div>
    );
};

export default FinancialServicesPage;
