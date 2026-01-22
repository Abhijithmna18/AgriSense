import React, { useState, useEffect } from 'react';

const LoanApplicationModal = ({ isOpen, onClose, eligibilityData, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        amount: 50000,
        purpose: 'Seeds & Fertilizers',
        tenureMonths: 6
    });
    const [calculatedEmi, setCalculatedEmi] = useState(0);

    useEffect(() => {
        if (eligibilityData) {
            // Recalculate EMI
            const r = eligibilityData.interestRate / 12 / 100;
            const P = formData.amount;
            const n = formData.tenureMonths;

            const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            setCalculatedEmi(Math.round(emi));
        }
    }, [formData, eligibilityData]);

    if (!isOpen) return null;

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop with Blur */}
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal Container */}
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full ring-1 ring-slate-900/5">

                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800" id="modal-title">
                            {step === 1 ? 'Configure Your Loan' : 'Review & Confirm'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {step === 1 ? 'Select amount and tenure that suits you.' : 'Please verify details before submitting.'}
                        </p>
                    </div>

                    <div className="px-6 py-6">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Loan Amount</label>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-slate-400">₹10k</span>
                                        <span className="text-lg font-bold text-emerald-600">₹{formData.amount.toLocaleString()}</span>
                                        <span className="text-xs text-slate-400">₹{eligibilityData?.maxLoanAmount / 1000}k</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10000"
                                        max={eligibilityData?.maxLoanAmount}
                                        step="5000"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose of Loan</label>
                                    <select
                                        value={formData.purpose}
                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        className="block w-full py-2.5 px-3 border border-slate-200 bg-slate-50 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-shadow"
                                    >
                                        <option>Seeds & Fertilizers</option>
                                        <option>Farm Equipment</option>
                                        <option>Labor Payments</option>
                                        <option>Irrigation Setup</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-3">Repayment Tenure</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[6, 12, 18, 24].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => setFormData({ ...formData, tenureMonths: m })}
                                                className={`py-2 text-sm font-medium rounded-lg border transition-all ${formData.tenureMonths === m
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                                                    }`}
                                            >
                                                {m} M
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                        <div className="text-slate-500">Loan Amount</div>
                                        <div className="font-bold text-slate-800 text-right">₹{formData.amount.toLocaleString()}</div>

                                        <div className="text-slate-500">Interest Rate</div>
                                        <div className="font-bold text-slate-800 text-right">{eligibilityData?.interestRate}% p.a.</div>

                                        <div className="text-slate-500">Tenure</div>
                                        <div className="font-bold text-slate-800 text-right">{formData.tenureMonths} Months</div>

                                        <div className="col-span-2 border-t border-slate-200 pt-3 mt-1 flex justify-between items-center">
                                            <span className="font-bold text-slate-900">Monthly EMI</span>
                                            <span className="font-bold text-emerald-600 text-xl">₹{calculatedEmi.toLocaleString()}</span>
                                        </div>
                                    </dl>
                                </div>

                                <div className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    <input type="checkbox" className="mt-1 h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" defaultChecked />
                                    <label className="ml-3 block text-xs text-blue-800 leading-tight">
                                        I confirm that the details provided are accurate and I authorize the bank to process my credit report for this application.
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-slate-100">
                        <button
                            onClick={step === 1 ? handleNext : handleSubmit}
                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-2.5 bg-emerald-600 text-base font-bold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm transition-all"
                        >
                            {step === 1 ? 'Review Details' : 'Confirm & Apply'}
                        </button>
                        <button
                            onClick={step === 1 ? onClose : handleBack}
                            className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-6 py-2.5 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanApplicationModal;
