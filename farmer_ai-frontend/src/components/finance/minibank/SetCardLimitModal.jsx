import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, CreditCard } from 'lucide-react';

const SetCardLimitModal = ({ isOpen, onClose, onSetLimit, currentLimit, walletBalance }) => {
    const [limit, setLimit] = useState(currentLimit?.toString() || '');
    const [errors, setErrors] = useState({});
    const [setting, setSetting] = useState(false);

    // Validation pattern
    const patterns = {
        limit: /^\d+(\.\d{0,2})?$/ // Numbers with optional 2 decimal places
    };

    const handleChange = (e) => {
        const { value } = e.target;
        
        const cleanValue = value.replace(/\s/g, '');
        
        if (cleanValue && !patterns.limit.test(cleanValue)) {
            setErrors({ 
                limit: 'Only numbers allowed. Use decimal point for cents (e.g., 50000.00)' 
            });
            return;
        }
        
        setLimit(cleanValue);
        if (errors.limit) {
            setErrors({});
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === ' ') {
            e.preventDefault();
            setErrors({ 
                limit: 'Spaces are not allowed in this field' 
            });
            setTimeout(() => {
                setErrors({});
            }, 2000);
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!limit || parseFloat(limit) <= 0) {
            newErrors.limit = 'Please enter a valid limit';
        } else if (!patterns.limit.test(limit)) {
            newErrors.limit = 'Invalid limit format';
        } else if (parseFloat(limit) < 1000) {
            newErrors.limit = 'Minimum card limit is ₹1,000';
        } else if (parseFloat(limit) > 500000) {
            newErrors.limit = 'Maximum card limit is ₹5,00,000';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setSetting(true);
        try {
            await onSetLimit(parseFloat(limit));
            
            // Reset form
            setLimit('');
            setErrors({});
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to set card limit' });
        } finally {
            setSetting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Set Card Limit</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Limit */}
                    {currentLimit && (
                        <div className="bg-purple-50 rounded-lg p-4">
                            <div className="text-sm text-purple-600 mb-1">Current Limit</div>
                            <div className="text-2xl font-bold text-purple-900">
                                ₹{currentLimit.toLocaleString('en-IN')}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New Limit */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                New Spending Limit *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    value={limit}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                                        errors.limit ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                />
                            </div>
                            {errors.limit && (
                                <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{errors.limit}</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                Range: ₹1,000 - ₹5,00,000 • Format: Numbers only (e.g., 50000)
                            </p>
                        </div>

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h5 className="font-medium text-blue-900 mb-2">About Card Limits:</h5>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                <li>Daily spending limit for your virtual card</li>
                                <li>Helps control and track expenses</li>
                                <li>Can be changed anytime</li>
                                <li>Transactions exceeding limit will be declined</li>
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
                                disabled={setting}
                                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {setting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Setting...
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="w-4 h-4" />
                                        Set Limit
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

export default SetCardLimitModal;
