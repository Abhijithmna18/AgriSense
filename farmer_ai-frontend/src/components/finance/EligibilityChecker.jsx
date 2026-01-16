import React, { useState } from 'react';

const EligibilityChecker = ({ onCheck, result, loading }) => {

    if (result) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Microloan Eligibility</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${result.isEligible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {result.isEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Circular Progress Placeholder - simpler than using a library for just this */}
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#eee"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={result.score > 650 ? "#10B981" : "#EF4444"}
                                strokeWidth="3"
                                strokeDasharray={`${result.score / 900 * 100}, 100`}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-bold text-gray-800">{result.score}</span>
                            <span className="text-xs text-gray-400">/ 900</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500 text-sm">Max Loan Amount</span>
                        <span className="font-semibold text-gray-800">₹{result.maxLoanAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500 text-sm">Interest Rate</span>
                        <span className="font-semibold text-gray-800">{result.interestRate}% p.a.</span>
                    </div>

                    {result.riskFactors && result.riskFactors.length > 0 && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <p className="text-xs font-semibold text-orange-700 mb-1">Risk Factors:</p>
                            <ul className="list-disc list-inside text-xs text-orange-600">
                                {result.riskFactors.map((factor, idx) => (
                                    <li key={idx}>{factor}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {!result.isEligible && (
                    <div className="mt-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">How to improve?</h4>
                        <div className="space-y-2">
                            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs text-blue-600 flex items-center">
                                <span>+ Add missing expense records</span>
                            </button>
                            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-xs text-blue-600 flex items-center">
                                <span>+ Sell produce via marketplace</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default State
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-center items-center text-center">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Check Microloan Eligibility</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
                Get an instant credit score based on your farm inputs, yield history, and transactions.
            </p>
            <button
                onClick={onCheck}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                Check Eligibility
            </button>
        </div>
    );
};

export default EligibilityChecker;
