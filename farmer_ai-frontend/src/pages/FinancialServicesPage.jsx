import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import FinancialSidebar from '../components/finance/FinancialSidebar';
import FinancialOverview from '../components/finance/sections/FinancialOverview';
import FinancialModuleExecution from '../components/finance/FinancialModuleExecution';
import MarginAnalysis from '../components/finance/buyer/MarginAnalysis';
import BankIntegration from '../components/finance/sections/BankIntegration';
import GovernmentSchemes from '../components/finance/sections/GovernmentSchemes';
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

        if (activeSection === 'bank_integration') {
            return <BankIntegration />;
        }

        if (activeSection === 'government_schemes') {
            return <GovernmentSchemes />;
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
        <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-green-50/20 to-lime-50/30 font-sans pt-20 pb-12">
            {/* Enhanced Background Decoration with Green Theme */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-emerald-200/40 to-green-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-lime-200/40 to-teal-300/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">

                {/* 1. Enhanced Global Navigation Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <Link to="/dashboard" className="inline-flex items-center text-emerald-600/70 hover:text-emerald-700 transition-colors group mb-3 text-xs font-bold uppercase tracking-wider">
                            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Return to Dashboard
                        </Link>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">Financial Suite</span>
                                <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
                                {currentSectionLabel}
                            </h1>
                        </div>
                    </div>

                    {/* Enhanced Global Context: Date & Health Badge */}
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:flex items-center gap-2.5 bg-white/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl border-2 border-emerald-200/60 shadow-lg shadow-emerald-100/50 text-sm font-semibold text-emerald-700 hover:bg-white hover:shadow-xl hover:border-emerald-300 transition-all hover:scale-105">
                            <Calendar size={18} className="text-emerald-600" />
                            <span>This Season</span>
                        </button>

                        {!loading && (
                            <div className="group bg-white/90 backdrop-blur-xl pl-4 pr-5 py-2 rounded-2xl border-2 border-emerald-200/60 flex items-center gap-3 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:border-emerald-300 transition-all cursor-default hover:scale-105">
                                <div className="relative w-10 h-10 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="20" cy="20" r="16" stroke="#D1FAE5" strokeWidth="4" fill="none" />
                                        <circle 
                                            cx="20" 
                                            cy="20" 
                                            r="16" 
                                            stroke={healthScore > 70 ? "#10B981" : "#F59E0B"} 
                                            strokeWidth="4" 
                                            fill="none" 
                                            strokeDasharray="100" 
                                            strokeDashoffset={100 - (100 * healthScore) / 100} 
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <span className="absolute text-[11px] font-black text-emerald-700">{healthScore}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider leading-none mb-0.5">Health Score</span>
                                    <span className={`text-sm font-bold leading-tight ${healthScore > 70 ? "text-emerald-600" : "text-amber-500"}`}>
                                        {healthScore > 80 ? "Excellent" : "Good"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* 2. Left Sidebar */}
                    <FinancialSidebar
                        activeSection={activeSection}
                        onNavigate={setActiveSection}
                        navigationItems={config.navigation}
                    />

                    {/* 3. Main Content Area with Enhanced Container */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-white/60 shadow-2xl shadow-emerald-200/20 p-8">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default FinancialServicesPage;
