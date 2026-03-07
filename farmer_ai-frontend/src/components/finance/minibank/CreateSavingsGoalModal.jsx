import React, { useState, useEffect } from 'react';
import { X, Target, DollarSign, Calendar, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import * as miniBankApi from '../../../api/miniBankApi';

const CreateSavingsGoalModal = ({ isOpen, onClose, onCreate, walletBalance }) => {
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: '',
        category: 'general'
    });
    const [errors, setErrors] = useState({});
    const [creating, setCreating] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const categories = [
        { value: 'general', label: 'General Savings' },
        { value: 'equipment', label: 'Farm Equipment' },
        { value: 'seeds', label: 'Seeds & Supplies' },
        { value: 'emergency', label: 'Emergency Fund' },
        { value: 'education', label: 'Education' },
        { value: 'expansion', label: 'Farm Expansion' }
    ];

    // Validation patterns
    const patterns = {
        name: /^[a-zA-Z0-9]+$/, // Only alphanumeric, no spaces
        targetAmount: /^\d+(\.\d{0,2})?$/, // Numbers with optional 2 decimal places
        currentAmount: /^\d+(\.\d{0,2})?$/
    };

    useEffect(() => {
        if (isOpen) {
            fetchAIRecommendations();
        }
    }, [isOpen]);

    const fetchAIRecommendations = async () => {
        setLoadingAI(true);
        try {
            console.log('Fetching AI recommendations...');
            const recommendations = await miniBankApi.getSavingsAIRecommendations();
            console.log('AI Recommendations received:', recommendations);
            setAiRecommendations(recommendations);
        } catch (error) {
            console.error('Failed to fetch AI recommendations:', error);
            console.error('Error details:', error.response?.data || error.message);
            // Provide fallback recommendations
            const fallbackRecommendations = {
                suggestedGoals: [
                    { name: 'EmergencyFund', amount: 50000, reason: 'Build financial safety net' },
                    { name: 'FarmEquipment', amount: 100000, reason: 'Upgrade farming tools' },
                    { name: 'SeedStock', amount: 30000, reason: 'Quality seeds for next season' }
                ],
                monthlySavingCapacity: 5000,
                recommendedTimeline: '12 months'
            };
            console.log('Using fallback recommendations:', fallbackRecommendations);
            setAiRecommendations(fallbackRecommendations);
        } finally {
            setLoadingAI(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for name - prevent spaces and validate characters
        if (name === 'name') {
            const cleanValue = value.replace(/\s/g, '');
            
            if (cleanValue && !patterns.name.test(cleanValue)) {
                setErrors(prev => ({ 
                    ...prev, 
                    name: 'Only letters and numbers allowed. No spaces or special characters.' 
                }));
                return;
            }
            
            setFormData(prev => ({ ...prev, [name]: cleanValue }));
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
            return;
        }

        // Special handling for amounts - only numbers and decimal
        if (name === 'targetAmount' || name === 'currentAmount') {
            const cleanValue = value.replace(/\s/g, '');
            
            if (cleanValue && !patterns[name].test(cleanValue)) {
                setErrors(prev => ({ 
                    ...prev, 
                    [name]: 'Only numbers allowed. Use decimal point for cents (e.g., 100.50)' 
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
        if ((fieldName === 'name' || fieldName === 'targetAmount' || fieldName === 'currentAmount') && e.key === ' ') {
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

    const applySuggestion = (suggestion) => {
        setFormData(prev => ({
            ...prev,
            name: suggestion.name.replace(/\s/g, ''),
            targetAmount: suggestion.amount.toString()
        }));
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Goal name is required';
        } else if (!patterns.name.test(formData.name)) {
            newErrors.name = 'Invalid format. Only letters and numbers allowed.';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Goal name must be at least 3 characters';
        }
        
        if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
            newErrors.targetAmount = 'Please enter a valid target amount';
        } else if (!patterns.targetAmount.test(formData.targetAmount)) {
            newErrors.targetAmount = 'Invalid amount format';
        } else if (parseFloat(formData.targetAmount) < 100) {
            newErrors.targetAmount = 'Minimum target amount is ₹100';
        }

        const currentAmount = parseFloat(formData.currentAmount) || 0;
        if (currentAmount > parseFloat(formData.targetAmount)) {
            newErrors.currentAmount = 'Current amount cannot exceed target amount';
        } else if (currentAmount > walletBalance) {
            newErrors.currentAmount = `Cannot exceed wallet balance: ₹${walletBalance.toLocaleString('en-IN')}`;
        }

        if (!formData.deadline) {
            newErrors.deadline = 'Please select a target date';
        } else {
            const deadlineDate = new Date(formData.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (deadlineDate <= today) {
                newErrors.deadline = 'Deadline must be in the future';
            }
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
                ...formData,
                targetAmount: parseFloat(formData.targetAmount),
                currentAmount: parseFloat(formData.currentAmount) || 0
            });
            
            // Reset form
            setFormData({
                name: '',
                targetAmount: '',
                currentAmount: '0',
                deadline: '',
                category: 'general'
            });
            setErrors({});
            onClose();
        } catch (error) {
            setErrors({ submit: error.message || 'Failed to create savings goal' });
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    const progress = formData.targetAmount ? 
        ((parseFloat(formData.currentAmount) || 0) / parseFloat(formData.targetAmount) * 100).toFixed(1) : 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Target className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Create Savings Goal</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Debug Info - Remove after testing */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-slate-100 rounded-lg p-3 text-xs">
                            <div className="font-mono">
                                <div>Loading AI: {loadingAI ? 'Yes' : 'No'}</div>
                                <div>AI Recommendations: {aiRecommendations ? 'Loaded' : 'Not Loaded'}</div>
                                {aiRecommendations && (
                                    <div className="mt-2">
                                        <div>Capacity: ₹{aiRecommendations.monthlySavingCapacity}</div>
                                        <div>Goals: {aiRecommendations.suggestedGoals?.length || 0}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* AI Recommendations */}
                    {loadingAI ? (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <Sparkles className="w-5 h-5 animate-pulse" />
                                <span className="font-medium">AI is analyzing your finances...</span>
                            </div>
                        </div>
                    ) : aiRecommendations && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                            <div className="flex items-center gap-2 text-emerald-700 font-medium mb-3">
                                <Sparkles className="w-5 h-5" />
                                <span>AI Recommendations</span>
                            </div>
                            
                            <div className="space-y-2 mb-3">
                                <div className="flex items-center gap-2 text-sm text-emerald-800">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Monthly Saving Capacity: ₹{aiRecommendations.monthlySavingCapacity?.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="text-sm text-emerald-800">
                                    Recommended Timeline: {aiRecommendations.recommendedTimeline}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-emerald-700">Suggested Goals:</p>
                                {aiRecommendations.suggestedGoals?.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => applySuggestion(suggestion)}
                                        className="w-full text-left p-3 bg-white rounded-lg border border-emerald-200 hover:border-emerald-400 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium text-slate-900">{suggestion.name}</div>
                                                <div className="text-xs text-slate-600">{suggestion.reason}</div>
                                            </div>
                                            <div className="text-emerald-700 font-bold">
                                                ₹{suggestion.amount.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Goal Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Goal Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onKeyDown={(e) => handleKeyDown(e, 'name')}
                                placeholder="e.g., NewTractor, EmergencyFund (no spaces)"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                    errors.name ? 'border-red-500' : 'border-slate-300'
                                }`}
                            />
                            {errors.name && (
                                <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{errors.name}</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                Format: Letters and numbers only (e.g., NewTractor, EmergencyFund2024)
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Target Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Target Amount *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    name="targetAmount"
                                    value={formData.targetAmount}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 'targetAmount')}
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        errors.targetAmount ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                />
                            </div>
                            {errors.targetAmount && (
                                <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{errors.targetAmount}</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                Minimum: ₹100
                            </p>
                        </div>

                        {/* Current Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Initial Contribution (Optional)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium">
                                    ₹
                                </span>
                                <input
                                    type="text"
                                    name="currentAmount"
                                    value={formData.currentAmount}
                                    onChange={handleChange}
                                    onKeyDown={(e) => handleKeyDown(e, 'currentAmount')}
                                    placeholder="0.00"
                                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        errors.currentAmount ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                />
                            </div>
                            {errors.currentAmount && (
                                <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{errors.currentAmount}</p>
                                </div>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                                Available Balance: ₹{walletBalance?.toLocaleString('en-IN')}
                            </p>
                        </div>

                        {/* Deadline */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Target Date *
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                                        errors.deadline ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                />
                            </div>
                            {errors.deadline && (
                                <div className="flex items-start gap-2 mt-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <p>{errors.deadline}</p>
                                </div>
                            )}
                        </div>

                        {/* Progress Preview */}
                        {formData.targetAmount && (
                            <div className="bg-emerald-50 rounded-lg p-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600">Progress</span>
                                    <span className="font-bold text-emerald-700">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div
                                        className="bg-emerald-500 h-3 rounded-full transition-all"
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-600 mt-2">
                                    <span>₹{(parseFloat(formData.currentAmount) || 0).toLocaleString('en-IN')}</span>
                                    <span>₹{parseFloat(formData.targetAmount).toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        )}

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
                                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Target className="w-4 h-4" />
                                        Create Goal
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

export default CreateSavingsGoalModal;
