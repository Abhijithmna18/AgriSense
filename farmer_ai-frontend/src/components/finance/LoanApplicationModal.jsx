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
            // Recalculate EMI whenever amount or tenure changes
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
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Apply for Microloan
                                </h3>

                                {step === 1 && (
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Loan Amount (₹)</label>
                                            <input
                                                type="range"
                                                min="10000"
                                                max={eligibilityData?.maxLoanAmount}
                                                step="5000"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                                className="w-full mt-2"
                                            />
                                            <div className="text-right font-bold text-green-600">₹{formData.amount.toLocaleString()}</div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Purpose</label>
                                            <select
                                                value={formData.purpose}
                                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                            >
                                                <option>Seeds & Fertilizers</option>
                                                <option>Equipment</option>
                                                <option>Labor</option>
                                                <option>Irrigation Infrastructure</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Repayment Tenure</label>
                                            <div className="flex gap-2 mt-2">
                                                {[6, 12, 18, 24].map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => setFormData({ ...formData, tenureMonths: m })}
                                                        className={`px-4 py-2 text-sm rounded-md border ${formData.tenureMonths === m ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                                    >
                                                        {m} Months
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="mt-4 space-y-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                                <div className="text-gray-500">Loan Amount</div>
                                                <div className="font-semibold text-right">₹{formData.amount.toLocaleString()}</div>

                                                <div className="text-gray-500">Interest Rate</div>
                                                <div className="font-semibold text-right">{eligibilityData?.interestRate}% p.a.</div>

                                                <div className="text-gray-500">Tenure</div>
                                                <div className="font-semibold text-right">{formData.tenureMonths} Months</div>

                                                <div className="col-span-2 border-t pt-2 mt-2 flex justify-between items-center">
                                                    <span className="font-bold text-gray-800">Monthly EMI</span>
                                                    <span className="font-bold text-green-600 text-lg">₹{calculatedEmi.toLocaleString()}</span>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="flex items-start">
                                            <input type="checkbox" className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded" />
                                            <label className="ml-2 block text-xs text-gray-500">
                                                I agree to the terms and conditions and authorize the automatic deduction of EMI from my linked bank account.
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        {step === 1 ? (
                            <button
                                onClick={handleNext}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Review Application
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Submit Application
                            </button>
                        )}
                        <button
                            onClick={step === 1 ? onClose : handleBack}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
