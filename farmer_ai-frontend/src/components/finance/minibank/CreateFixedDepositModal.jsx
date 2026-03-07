import React, { useState, useEffect } from 'react';
import { X, PiggyBank, DollarSign, Calendar, Percent, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import * as miniBankApi from '../../../api/miniBankApi';

const CreateFixedDepositModal = ({ isOpen, onClose, onCreate, walletBalance }) => {
    const [formData, setFormData] = useState({
        amount: '',
        duration: '12',
        rate: '7.5'
    });
    const [errors, setErrors] = useState({});
    const [creating, setCreating] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const durationOptions = [
        { value: '6', label: '6 Months', rate: 6.5 },
        { value: '12', label: '1 Year', rate: 7.5 },
        { value: '24', label: '2 Years', rate: 8.0 },
        { value: '36', label: '3 Years', rate: 8.5 },
        { value: '60', label: '5 Years', rate: 9.0 }
    ];

    // Validation patterns
    const patterns = {
        amount: /^\d+(\.\d{0,2})?$/ // Numbers with optional 2 decimal places
    };

    useEffect(() => {
        if (isOpen) {
            fetchAIRecommendations();
        }
    }, [isOpen]);

    useEffect(() => {
        // Update rate when duration changes
        const selected = durationOptions.find(opt => opt.value === formData.duration);
        if (selected) {
            setFormData(prev => ({ ...prev, rate: selected.rate.toString() }));
        }
    }, [formData.duration]);

    const fetchAIRecommendations = async () => {
        setLoadingAI(true);
        try {
            const recommendations = await miniBankApi.getFDRecommendations();
            setAiRecommendations(recommendations);
        } catch (error) {
            console.error('Failed to fetch AI recommendations:', error);
            // Provide fallback recommendations
            setAiRecommendations({
                recommendedAmount: Math.min(walletBalance * 0.3, 100000),
                recommendedDuration: 12,
                projectedReturns: Math.round(Math.min(walletBalance * 0.3, 100000) * 0.075),
                reasoning: 'Based on your current balance, investing 30% in FD is recommended'
            });
        } finally {
            setLoadingAI(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for amount - only numbers and decimal
        if (name === 'amount') {
            const cleanValue = value.replace(/\s/g, '');
            
            if (cleanValue && !patterns.amount.test(cleanValue)) {
                setErrors(prev => ({ 
                    ...prev, 
                    amount: 'Only numbers allowed. Use decimal point for cents (e.g., 100.50)' 
                }));
                return;
            }
            
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
            return;
        }

        // For other fields
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleKeyDown = (e, fieldName) => {
        if (fieldName === 'amount' && e.key === ' ') {
            e.preventDefault();
            setErrors(prev => ({ 
                ...prev, 
                [fieldName]: 'Spaces are not allowed in this field' 
            }));
            setTimeout(() => {
                setErrors(prev => ({ ...prev, [fieldName]: '' }));
            }, 2000);
        }
    };

    const applyAIRecommendation = () => {
        if (aiRecommendations) {
            setFormData(prev => ({
                ...prev,
                amount: aiRecommendations.recommendedAmount.toString(),
                duration: aiRecommendations.recommendedDuration.toString()
            }));
        }
    };

    const calculateMaturity = () => {
        const principal = parseFloat(formData.amount) || 0;
        const rate = parseFloat(formData.rate) || 0;
        const duration = parseInt(formData.duration) || 0;
        
        // Simple interest calculation
        const interest = (principal * rate * duration) / (12 * 100);
        const maturityAmount = principal + interest;
        
        return {
            principal,
            interest: interest.toFixed(2),
            maturityAmount: maturityAmount.toFixed(2),
            duration
        };
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (!patterns.amount.test(formData.amount)) {
            newErrors.amount = 'Invalid amount format';
        } else if (parseFloat(formData.amount) < 1000) {
            newErrors.amount = 'Minimum FD amount is ₹1,000';
        } else if (parseFloat(formData.amount) > walletBalance) {
            newErrors.amount = `Insufficient balance. Available: ₹${walletBalance.toLocaleString('en-IN')}`;
        }

        if (!formData.duration) {
            newErrors.duration = 'Please select a duration';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setCreating(true);
        try {
            await onCreate({
                amount: parseFloat(formData.amount),
                duration: parseInt(formData.duration),
                rate: parseFloat(formData.rate)
            });
            
            // Reset form
            setFormData({
                amount: '',
                duration: '12',
                rate: '7.5'
            });
            setErrors({});
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to create fixed deposit' });
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    const maturityDetails = calculateMaturity();
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + parseInt(formData.duration || 0));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <PiggyBank className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Create Fixed Deposit</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* AI Recommendations */}
                    {loadingAI ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Sparkles className="w-5 h-5 animate-pulse" />
                                <span className="font-medium">AI is analyzing your finances...</span>
                            </div>
                        </div>
                    ) : aiRecommendations && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center gap-2 text-blue-700 font-medium mb-3">
                                <Sparkles className="w-5 h-5" />
                                <span>AI Investment Recommendation</span>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-sm text-blue-800">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Recommended Amount: ₹{aiRecommendations.recommendedAmount?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="text-sm text-blue-800">
                                    Duration: {aiRecommendations.recommendedDuration} months
                                </div>
                                <div className="text-sm text-blue-800">
                                    Projected Returns: ₹{aiRecommendations.projectedReturns?.toLocaleString('en-IN')}
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 border border-blue-200 mb-3">
                                <p className="text-sm text-slate-700">{aiRecommendations.reasoning}</p>
                            </div>

                            <button
                                type="button"
                                onClick={applyAIRecommendation}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Apply AI Recommendation
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Available Balance */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm text-blue-600 mb-1">Available Balance</div>
                            <div className="text-2xl font-bold text-blue-900">
                                ₹{walletBalance?.toLocaleString('en-IN') || '0'}
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Deposit Amount *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 'amount')}
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.amount ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                />
                            </div>
                            {errors.amount && (
                                <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{errors.amount}</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                Minimum: ₹1,000 • Format: Numbers only (e.g., 50000, 100000.50)
                            </p>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Duration *
                            </label>
                            <select
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {durationOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label} - {opt.rate}% p.a.
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Interest Rate (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Interest Rate
                            </label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={`${formData.rate}% per annum`}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Maturity Details */}
                        {formData.amount && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Maturity Details
                                </h4>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Principal Amount:</span>
                                        <span className="font-semibold text-slate-900">
                                            ₹{parseFloat(maturityDetails.principal).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Interest Earned:</span>
                                        <span className="font-semibold text-green-600">
                                            +₹{parseFloat(maturityDetails.interest).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    
                                    <div className="h-px bg-blue-200"></div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-700 font-medium">Maturity Amount:</span>
                                        <span className="font-bold text-xl text-blue-700">
                                            ₹{parseFloat(maturityDetails.maturityAmount).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm text-slate-600 pt-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>Matures on: {maturityDate.toLocaleDateString('en-IN', { 
                                            day: 'numeric', 
                                            month: 'long', 
                                            year: 'numeric' 
                                        })}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Important Notes */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h5 className="font-medium text-amber-900 mb-2">Important Notes:</h5>
                            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                                <li>Amount will be deducted from your wallet immediately</li>
                                <li>Early withdrawal may incur penalties</li>
                                <li>Interest is calculated on simple interest basis</li>
                                <li>Maturity amount will be credited to your wallet</li>
                            </ul>
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-600 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <PiggyBank className="w-4 h-4" />
                                        Create Fixed Deposit
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateFixedDepositModal;
