import React from 'react';
import { CheckCircle, AlertCircle, ArrowRight, Shield } from 'lucide-react';

const EligibilityChecker = ({ onCheck, result, loading }) => {

    if (result) {
        // Calculate color based on score
        const getScoreColor = (score) => {
            if (score >= 750) return 'text-emerald-500';
            if (score >= 650) return 'text-blue-500';
            return 'text-amber-500';
        };
        const scoreColor = getScoreColor(result.score);
        const strokeColor = result.score >= 750 ? '#10B981' : result.score >= 650 ? '#3B82F6' : '#F59E0B';

        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Shield size={18} className="text-slate-400" /> Loan Eligibility
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${result.isEligible ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {result.isEligible ? 'Approved' : 'Review Needed'}
                    </span>
                </div>

                <div className="flex flex-col items-center mb-8 relative">
                    {/* Semi-Circle Gauge */}
                    <div className="relative w-48 h-24 overflow-hidden">
                        <div className="absolute top-0 left-0 w-48 h-48 border-[12px] border-slate-100 rounded-full box-border"></div>
                        <div
                            className="absolute top-0 left-0 w-48 h-48 border-[12px] rounded-full box-border transition-all duration-1000 ease-out"
                            style={{
                                borderColor: strokeColor,
                                borderBottomColor: 'transparent',
                                borderRightColor: 'transparent',
                                borderLeftColor: 'transparent',
                                clipPath: 'inset(0 0 50% 0)', // Clip bottom half
                                transform: `rotate(${(result.score / 900) * 180 - 180}deg)` // Map score to rotation
                            }}
                        ></div>
                    </div>

                    {/* Score Text (Centered absolutely relative to the gauge container would be better, but this stacking works for visual) */}
                    <div className="absolute top-12 flex flex-col items-center">
                        <span className={`text-5xl font-bold tracking-tighter ${scoreColor}`}>
                            {result.score}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase mt-1">Credit Score</span>
                    </div>

                    <div className="flex justify-between w-full px-4 mt-2 text-xs font-medium text-slate-300">
                        <span>300</span>
                        <span>900</span>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-slate-500 text-sm">Max Limit</span>
                        <span className="font-bold text-slate-800 text-lg">₹{result.maxLoanAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-slate-500 text-sm">Interest Rate</span>
                        <span className="font-semibold text-slate-800">{result.interestRate}% <span className="text-xs text-slate-400 font-normal">p.a.</span></span>
                    </div>
                </div>

                {result.riskFactors && result.riskFactors.length > 0 && (
                    <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100 mb-4">
                        <p className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
                            <AlertCircle size={12} /> Risk Factors
                        </p>
                        <ul className="space-y-1">
                            {result.riskFactors.map((factor, idx) => (
                                <li key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                                    {factor}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {!result.isEligible && (
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Improvement Checklist</h4>
                        <div className="space-y-2">
                            {[
                                "Link secondary bank account",
                                "Clear pending fertilizer payments",
                                "Update land ownership documents"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
                                    <div className="w-4 h-4 rounded border border-slate-300 group-hover:border-blue-500" />
                                    <span className="text-sm text-slate-600 group-hover:text-blue-600">{item}</span>
                                    <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default State
    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-8 text-center text-white relative overflow-hidden h-full flex flex-col justify-center items-center">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="bg-white/10 p-4 rounded-2xl mb-6 backdrop-blur-sm shadow-inner border border-white/5 relative z-10">
                <Shield size={32} className="text-emerald-400" />
            </div>

            <h3 className="text-2xl font-bold mb-2 relative z-10">Check Eligibility</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xs relative z-10">
                Get your instant credit limit. No impact on your external CIBIL score.
            </p>

            <button
                onClick={onCheck}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analyzing...</span>
                    </>
                ) : (
                    <>
                        <span>Check Now</span>
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </div>
    );
};

export default EligibilityChecker;
