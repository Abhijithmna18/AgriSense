import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import FinancialSidebar from '../components/finance/FinancialSidebar';
import FinancialOverview from '../components/finance/sections/FinancialOverview';
import FinancialModuleExecution from '../components/finance/FinancialModuleExecution';
import MarginAnalysis from '../components/finance/buyer/MarginAnalysis';
import { getFinancialSnapshot, checkEligibility, getLoans, getTransactions, getFinancialInsight } from '../api/financeApi';
import { useAuth } from '../context/AuthContext';
import { getFinanceConfig } from '../components/finance/config/financeConfig';

const FinancialServicesPage = () => {
    const { activeRole } = useAuth();
    const config = getFinanceConfig(activeRole);

    // Default to the first navigation item (usually 'overview')
    const [activeSection, setActiveSection] = useState(config.navigation[0].id);

    // Reset active section when role/config changes
    useEffect(() => {
        setActiveSection(config.navigation[0].id);
    }, [activeRole]);

    // Global Data State
    const [snapshotData, setSnapshotData] = useState(null);
    const [loans, setLoans] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [eligibilityData, setEligibilityData] = useState(null);
    const [aiInsight, setAiInsight] = useState(null);

    // Loading State
    const [loading, setLoading] = useState(true);

    // Fetch Global Data
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [snapshot, loansData, txData, eligibility, insight] = await Promise.all([
                    getFinancialSnapshot(),
                    getLoans(),
                    getTransactions(),
                    checkEligibility(),
                    getFinancialInsight()
                ]);

                setSnapshotData(snapshot);
                setLoans(loansData);
                setTransactions(txData);
                setEligibilityData(eligibility);
                setAiInsight(insight.insight);
            } catch (error) {
                console.error("Failed to load financial context", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Health Score Calculation (Global)
    const healthScore = snapshotData ? Math.min(100, Math.max(0, 75 + (snapshotData.financialRisk === 'Low' ? 15 : -10))) : 0;

    // Get current section label
    const currentSectionLabel = config.navigation.find(n => n.id === activeSection)?.label || 'Finance';

    // Content Renderer
    const renderContent = () => {
        const dataContext = {
            snapshotData,
            loans,
            transactions,
            eligibilityData
        };

        if (activeSection === 'overview') {
            return (
                <FinancialOverview
                    snapshotData={snapshotData}
                    loans={loans}
                    transactions={transactions}
                    eligibilityData={eligibilityData}
                    aiInsight={aiInsight}
                    loading={loading}
                    kpiConfig={config.overview.kpiCards}
                    aiPanelConfig={config.overview.aiPanel}
                />
            );
        }

        if (activeSection === 'margin_analysis' && activeRole === 'buyer') {
            return (
                <MarginAnalysis
                    dataContext={dataContext}
                    config={config.marginAnalysis}
                />
            );
        }

        // For all other sections delegate to the Execution Engine
        return (
            <FinancialModuleExecution
                moduleId={activeSection}
                moduleName={currentSectionLabel}
                dataContext={dataContext}
                config={config} // Pass full config to execution engine
            />
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans pt-20 pb-12">
            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            </div>

            <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">

                {/* 1. Global Navigation Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <Link to="/dashboard" className="inline-flex items-center text-slate-400 hover:text-indigo-600 transition-colors group mb-3 text-xs font-bold uppercase tracking-wider">
                            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Return to Dashboard
                        </Link>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-indigo-500 uppercase tracking-widest">Financial Suite</span>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{currentSectionLabel}</h1>
                        </div>
                    </div>

                    {/* Global Context: Date & Health Badge */}
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:flex items-center gap-2.5 bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-sm text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-md transition-all">
                            <Calendar size={18} className="text-indigo-500" />
                            <span>This Season</span>
                        </button>

                        {!loading && (
                            <div className="group bg-white/80 backdrop-blur pl-4 pr-5 py-2 rounded-2xl border border-slate-200/60 flex items-center gap-3 shadow-sm hover:shadow-md transition-all cursor-default">
                                <div className="relative w-10 h-10 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="20" cy="20" r="16" stroke="#E2E8F0" strokeWidth="4" fill="none" />
                                        <circle cx="20" cy="20" r="16" stroke={healthScore > 70 ? "#10B981" : "#F59E0B"} strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset={100 - (100 * healthScore) / 100} strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute text-[11px] font-black text-slate-700">{healthScore}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Health Score</span>
                                    <span className={`text-sm font-bold leading-tight ${healthScore > 70 ? "text-emerald-600" : "text-amber-500"}`}>
                                        {healthScore > 80 ? "Excellent" : "Good"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-10">
                    {/* 2. Left Sidebar */}
                    <FinancialSidebar
                        activeSection={activeSection}
                        onNavigate={setActiveSection}
                        navigationItems={config.navigation}
                    />

                    {/* 3. Main Content Area */}
                    <main className="flex-1 min-w-0">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default FinancialServicesPage;
