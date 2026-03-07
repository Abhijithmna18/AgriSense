import React, { useState } from 'react';
import { X, PiggyBank, AlertCircle, TrendingUp } from 'lucide-react';

const AddContributionModal = ({ isOpen, onClose, onAdd, goal, walletBalance }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);

    if (!isOpen || !goal) return null;

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/\s/g, '');
        
        if (value && !/^\d+(\.\d{0,2})?$/.test(value)) {
            setError('Only numbers allowed. Use decimal point for cents (e.g., 100.50)');
            return;
        }
        
        setAmount(value);
        setError('');
    };

    const handleKeyDown = (e) => {
        if (e.key === ' ') {
            e.preventDefault();
            setError('Spaces are not allowed');
            setTimeout(() => setError(''), 2000);
        }
    };

    const validate = () => {
        const numAmount = parseFloat(amount);
        
        if (!amount || numAmount <= 0) {
            setError('Please enter a valid amount');
            return false;
        }
        
        if (numAmount < 1) {
            setError('Minimum contribution is ₹1');
            return false;
        }
        
        if (numAmount > walletBalance) {
            setError(`Insufficient balance. Available: ₹${walletBalance.toLocaleString('en-IN')}`);
            return false;
        }
        
        const newTotal = goal.currentAmount + numAmount;
        if (newTotal > goal.targetAmount) {
            setError(`This would exceed your goal by ₹${(newTotal - goal.targetAmount).toLocaleString('en-IN')}`);
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;
        
        setAdding(true);
        try {
            await onAdd(goal, parseFloat(amount));
            setAmount('');
            setError('');
            onClose();
        } catch (error) {
            setError(error.message || 'Failed to add contribution');
        } finally {
            setAdding(false);
        }
    };

    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const newProgress = ((goal.currentAmount + (parseFloat(amount) || 0)) / goal.targetAmount) * 100;
    const remaining = goal.targetAmount - goal.currentAmount;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <PiggyBank className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Add Contribution</h3>
                            <p className="text-sm text-slate-600">{goal.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Goal Progress */}
                    <div className="bg-emerald-50 rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-600">Current Progress</span>
                            <span className="font-bold text-emerald-700">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                            <div
                                className="bg-emerald-500 h-3 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                            <span>₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="mt-2 text-sm text-emerald-700 font-medium">
                            ₹{remaining.toLocaleString('en-IN')} remaining
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Contribution Amount *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder="0.00"
                                    autoFocus
                                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        error ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                />
                            </div>
                            {error && (
                                <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                Available Balance: ₹{walletBalance.toLocaleString('en-IN')}
                            </p>
                        </div>

                        {/* New Progress Preview */}
                        {amount && parseFloat(amount) > 0 && !error && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-sm">After Contribution</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all"
                                        style={{ width: `${Math.min(newProgress, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-600">
                                    <span>₹{(goal.currentAmount + parseFloat(amount)).toLocaleString('en-IN')}</span>
                                    <span className="font-bold text-blue-700">{newProgress.toFixed(1)}%</span>
                                </div>
                            </div>
                        )}

                        {/* Quick Amount Buttons */}
                        <div>
                            <p className="text-xs font-medium text-slate-600 mb-2">Quick Add:</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[500, 1000, 2000, 5000].map(quickAmount => (
                                    <button
                                        key={quickAmount}
                                        type="button"
                                        onClick={() => {
                                            setAmount(quickAmount.toString());
                                            setError('');
                                        }}
                                        disabled={quickAmount > walletBalance || quickAmount > remaining}
                                        className="px-3 py-2 text-xs border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ₹{quickAmount}
                                    </button>
                                ))}
                            </div>
                        </div>

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
                                disabled={adding || !amount || parseFloat(amount) <= 0}
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {adding ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <PiggyBank className="w-4 h-4" />
                                        Add ₹{amount || '0'}
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

export default AddContributionModal;
