
import React, { useState, useEffect } from 'react';
import { getFinancialInsight } from '../../api/financeApi';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
    BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import {
    AlertTriangle, CheckCircle, Lock, RefreshCw,
    FileText, TrendingUp, Shield, Activity
} from 'lucide-react';
import SharedExpenseManager from './shared/SharedExpenseManager';
import FinanceHistory from './FinanceHistory';
import ProductReviews from './buyer/ProductReviews';

const FinancialModuleExecution = ({ moduleId, moduleName, dataContext, config }) => {
    const [executionState, setExecutionState] = useState({
        status: 'idle', // idle, loading, executed, blocked, error
        result: null,
        missingData: [],
        timestamp: null
    });

    useEffect(() => {
        // Only run execution for modules that rely on AI/Generic engine
        // Skip for direct component modules to avoid unnecessary API calls
        if (moduleId === 'expenses' || moduleId === 'transactions' || moduleId === 'credit' || moduleId === 'loans' || moduleId === 'product_reviews') {
            return;
        }

        if (!moduleId) return;
        executeModule();
    }, [moduleId]);

    const executeModule = async () => {
        setExecutionState(prev => ({ ...prev, status: 'loading' }));
        try {
            const query = `EXECUTE MODULE: ${moduleName}. Validate data availability and perform required calculations. Return strict JSON-like format per instructions.`;
            const response = await getFinancialInsight(query);
            const insightText = response.insight;
            const isExecuted = insightText.includes("Execution Status: Executed");
            const isBlocked = insightText.includes("Execution Status: Blocked");

            setExecutionState({
                status: isExecuted ? 'executed' : (isBlocked ? 'blocked' : 'executed'),
                result: insightText,
                missingData: [],
                timestamp: new Date()
            });

        } catch (error) {
            console.error("Module Execution Failed", error);
            setExecutionState({
                status: 'error',
                result: "System Engine Connection Failed. Please retry.",
                missingData: [],
                timestamp: null
            });
        }
    };

    // If the module maps to a direct component, we render that instead of the AI engine result
    if (moduleId === 'expenses') {
        const categories = config?.expenses?.categories || [];
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">{moduleName}</h2>
                </div>
                <SharedExpenseManager
                    transactions={dataContext?.transactions || []}
                    categories={categories}
                />
            </div>
        );
    }

    if (moduleId === 'transactions') {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">{moduleName}</h2>
                <FinanceHistory
                    loans={dataContext?.loans || []}
                    transactions={dataContext?.transactions || []}
                />
            </div>
        );
    }

    if (moduleId === 'credit' || moduleId === 'loans') {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">{moduleName}</h2>
                <FinanceHistory
                    loans={dataContext?.loans || []}
                    transactions={dataContext?.transactions || []}
                    defaultTab="loans"
                />
            </div>
        );
    }

    if (moduleId === 'product_reviews') {
        return (
            <div className="space-y-6">
                <ProductReviews />
            </div>
        );
    }

    // --- AI Execution Engine (Fallback for other modules) ---

    if (executionState.status === 'loading') {
        return (
            <div className="p-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-50 to-transparent animate-pulse" />
                    <RefreshCw className="text-indigo-500 animate-spin" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Executing {moduleName}...</h3>
                    <p className="text-slate-500 text-sm">Engine is analyzing available datasets via V3 Execution Protocol.</p>
                </div>
            </div>
        );
    }

    if (executionState.status === 'blocked') {
        return (
            <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 animate-in fade-in duration-300">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="text-amber-600 mt-1" size={24} />
                    <div className="space-y-4 flex-1">
                        <div>
                            <h3 className="text-lg font-bold text-amber-900">Execution Blocked: Missing Critical Data</h3>
                            <p className="text-amber-700 text-sm mt-1">The AI Engine cannot mathematically compute results for {moduleName} due to missing inputs.</p>
                        </div>
                        <div className="bg-white/50 p-4 rounded-lg text-sm text-amber-800 font-mono whitespace-pre-wrap border border-amber-200/50">
                            {executionState.result}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (executionState.status === 'executed') {
        // Parse the report text slightly to separate title if possible, or just style the block
        // Assuming report is plain text but we can wrap it nicely.

        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 shadow-sm">
                        <CheckCircle size={14} />
                        <span>Execution Successful</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono tracking-widest opacity-60">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {/* Report Header */}
                    <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-indigo-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-slate-900 font-bold text-lg">{moduleName} Report</h3>
                            <p className="text-xs text-slate-500 font-medium">Generated by AgriSense Engine v3.0</p>
                        </div>
                    </div>

                    {/* Report Content */}
                    <div className="p-8">
                        <div className="prose prose-slate prose-sm max-w-none">
                            <div className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-600 bg-white">
                                {executionState.result}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-end gap-3">
                        <button className="text-xs font-bold text-slate-500 hover:text-slate-800 px-4 py-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                            Download PDF
                        </button>
                        <button className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition-all">
                            Share Report
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default FinancialModuleExecution;
