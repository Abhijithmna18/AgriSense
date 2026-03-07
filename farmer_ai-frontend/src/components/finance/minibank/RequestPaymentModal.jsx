import React, { useState } from 'react';
import { X, Download, User, DollarSign, AlertCircle } from 'lucide-react';

const RequestPaymentModal = ({ isOpen, onClose, onRequest }) => {
    const [formData, setFormData] = useState({
        fromUserId: '',
        fromUserName: '',
        amount: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [requesting, setRequesting] = useState(false);

    if (!isOpen) return null;

    // Validation patterns
    const patterns = {
        fromUserId: /^[a-zA-Z0-9]+$/, // Only alphanumeric, no spaces
        fromUserName: /^[a-zA-Z]+$/, // Only letters, no spaces or numbers
        amount: /^\d+(\.\d{0,2})?$/ // Numbers with optional 2 decimal places
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for fromUserId - prevent spaces and validate characters
        if (name === 'fromUserId') {
            // Remove any spaces
            const cleanValue = value.replace(/\s/g, '');
            
            // Check if it contains only valid characters
            if (cleanValue && !patterns.fromUserId.test(cleanValue)) {
                setErrors(prev => ({ 
                    ...prev, 
                    fromUserId: 'Only letters and numbers allowed. No spaces or special characters.' 
                }));
                return; // Don't update the value
            }
            
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
            return;
        }

        // Special handling for fromUserName - only letters, no spaces
        if (name === 'fromUserName') {
            const cleanValue = value.replace(/\s/g, '');
            
            if (cleanValue && !patterns.fromUserName.test(cleanValue)) {
                setErrors(prev => ({ 
                    ...prev, 
                    fromUserName: 'Only letters allowed. No spaces, numbers, or special characters.' 
                }));
                return;
            }
            
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
            return;
        }

        // Special handling for amount - only numbers and decimal
        if (name === 'amount') {
            // Remove spaces
            const cleanValue = value.replace(/\s/g, '');
            
            // Allow empty or valid number format
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

        // For description, allow spaces but trim
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Prevent space key press for specific fields
    const handleKeyDown = (e, fieldName) => {
        if (fieldName !== 'description' && e.key === ' ') {
            e.preventDefault();
            setErrors(prev => ({ 
                ...prev, 
                [fieldName]: 'Spaces are not allowed in this field' 
            }));
            // Clear error after 2 seconds
            setTimeout(() => {
                setErrors(prev => ({ ...prev, [fieldName]: '' }));
            }, 2000);
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.fromUserId.trim()) {
            newErrors.fromUserId = 'Payer ID is required';
        } else if (!patterns.fromUserId.test(formData.fromUserId)) {
            newErrors.fromUserId = 'Invalid format. Only letters and numbers allowed.';
        } else if (formData.fromUserId.length < 3) {
            newErrors.fromUserId = 'Payer ID must be at least 3 characters';
        }
        
        if (formData.fromUserName && !patterns.fromUserName.test(formData.fromUserName)) {
            newErrors.fromUserName = 'Invalid format. Only letters allowed.';
        }
        
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (!patterns.amount.test(formData.amount)) {
            newErrors.amount = 'Invalid amount format';
        } else if (parseFloat(formData.amount) < 1) {
            newErrors.amount = 'Minimum amount is ₹1';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Please provide a reason for the payment request';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        setRequesting(true);
        try {
            await onRequest(formData);
            // Reset form
            setFormData({
                fromUserId: '',
                fromUserName: '',
                amount: '',
                description: ''
            });
            setErrors({});
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to request payment' });
        } finally {
            setRequesting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Download className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Request Payment</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Info Banner */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            Request money from another user. They will receive a notification and can approve or decline.
                        </p>
                    </div>

                    {/* Payer ID */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            From User ID / Phone Number *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="fromUserId"
                                value={formData.fromUserId}
                                onChange={handleChange}
                                onKeyDown={(e) => handleKeyDown(e, 'fromUserId')}
                                placeholder="Enter payer ID (no spaces)"
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                    errors.fromUserId ? 'border-red-500' : 'border-slate-300'
                                }`}
                            />
                        </div>
                        {errors.fromUserId && (
                            <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{errors.fromUserId}</p>
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            Format: Letters and numbers only (e.g., USER123, 9876543210)
                        </p>
                    </div>

                    {/* Payer Name (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            From User Name (Optional)
                        </label>
                        <input
                            type="text"
                            name="fromUserName"
                            value={formData.fromUserName}
                            onChange={handleChange}
                            onKeyDown={(e) => handleKeyDown(e, 'fromUserName')}
                            placeholder="Enter name (letters only, no spaces)"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                errors.fromUserName ? 'border-red-500' : 'border-slate-300'
                            }`}
                        />
                        {errors.fromUserName && (
                            <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{errors.fromUserName}</p>
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            Format: Letters only (e.g., JohnDoe, RajeshKumar)
                        </p>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Amount *
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
                                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                            Format: Numbers only (e.g., 100, 250.50) • Minimum: ₹1
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Reason for Request *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Why are you requesting this payment? (spaces allowed here)"
                            rows="3"
                            maxLength="200"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                                errors.description ? 'border-red-500' : 'border-slate-300'
                            }`}
                        />
                        {errors.description && (
                            <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{errors.description}</p>
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                            {formData.description.length}/200 characters
                        </p>
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
                            disabled={requesting}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {requesting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Requesting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Request Payment
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestPaymentModal;
