import React from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, Hash, Calendar, Shield, Package, Truck, AlertTriangle } from 'lucide-react';

const OfferFormModal = ({ form, setForm, baseline, onSubmit, onClose, submitting }) => {
    const handleInputChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const calculatePriceChange = () => {
        if (!form.price || !baseline.price) return null;
        const change = ((form.price - baseline.price) / baseline.price) * 100;
        return {
            percentage: change.toFixed(1),
            direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'same',
            amount: Math.abs(form.price - baseline.price)
        };
    };

    const calculateQuantityChange = () => {
        if (!form.quantity || !baseline.quantity) return null;
        const change = ((form.quantity - baseline.quantity) / baseline.quantity) * 100;
        return {
            percentage: change.toFixed(1),
            direction: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'same',
            amount: Math.abs(form.quantity - baseline.quantity)
        };
    };

    const priceChange = calculatePriceChange();
    const quantityChange = calculateQuantityChange();

    const getChangeColor = (direction) => {
        switch (direction) {
            case 'increase': return 'text-red-600';
            case 'decrease': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const validateForm = () => {
        const errors = [];
        
        if (!form.price || form.price <= 0) {
            errors.push('Price must be greater than 0');
        }
        
        if (!form.quantity || form.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        }
        
        if (!form.deliveryDate) {
            errors.push('Delivery date is required');
        } else {
            const deliveryDate = new Date(form.deliveryDate);
            const today = new Date();
            if (deliveryDate <= today) {
                errors.push('Delivery date must be in the future');
            }
        }

        // Business rule validations
        if (priceChange && priceChange.direction === 'decrease' && Math.abs(parseFloat(priceChange.percentage)) > 50) {
            errors.push('Price reduction cannot exceed 50%');
        }

        if (quantityChange && quantityChange.direction === 'increase' && Math.abs(parseFloat(quantityChange.percentage)) > 500) {
            errors.push('Quantity increase cannot exceed 500%');
        }

        return errors;
    };

    const formErrors = validateForm();
    const isValid = formErrors.length === 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Make New Offer</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-6">
                    {/* Price & Quantity Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <DollarSign size={16} />
                                Price per Unit
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.price}
                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || '')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={`Baseline: $${baseline.price}`}
                                required
                            />
                            {priceChange && priceChange.direction !== 'same' && (
                                <div className={`text-xs ${getChangeColor(priceChange.direction)} flex items-center gap-1`}>
                                    <span>
                                        {priceChange.direction === 'increase' ? '+' : '-'}${priceChange.amount} 
                                        ({priceChange.direction === 'increase' ? '+' : '-'}{priceChange.percentage}%)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Hash size={16} />
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={form.quantity}
                                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || '')}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={`Baseline: ${baseline.quantity} units`}
                                required
                            />
                            {quantityChange && quantityChange.direction !== 'same' && (
                                <div className={`text-xs ${getChangeColor(quantityChange.direction)} flex items-center gap-1`}>
                                    <span>
                                        {quantityChange.direction === 'increase' ? '+' : '-'}{quantityChange.amount} units 
                                        ({quantityChange.direction === 'increase' ? '+' : '-'}{quantityChange.percentage}%)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Date */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Calendar size={16} />
                            Delivery Date
                        </label>
                        <input
                            type="date"
                            value={form.deliveryDate}
                            onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    {/* Quality Requirements */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Shield size={16} />
                            Quality Requirements
                        </label>
                        <select
                            value={form.qualityRequirements}
                            onChange={(e) => handleInputChange('qualityRequirements', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select quality grade</option>
                            <option value="Premium">Premium</option>
                            <option value="Grade A">Grade A</option>
                            <option value="Grade B">Grade B</option>
                            <option value="Standard">Standard</option>
                            <option value="Organic Certified">Organic Certified</option>
                            <option value="Fair Trade">Fair Trade</option>
                        </select>
                    </div>

                    {/* Packaging */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Package size={16} />
                            Packaging Requirements
                        </label>
                        <textarea
                            value={form.packaging}
                            onChange={(e) => handleInputChange('packaging', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={3}
                            placeholder="Specify packaging requirements, materials, labeling, etc."
                        />
                    </div>

                    {/* Customization */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Truck size={16} />
                            Customization & Special Requirements
                        </label>
                        <textarea
                            value={form.customization}
                            onChange={(e) => handleInputChange('customization', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={3}
                            placeholder="Any special customization, processing, or delivery requirements"
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Message to Vendor
                        </label>
                        <textarea
                            value={form.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            rows={4}
                            placeholder="Explain your offer, reasoning, or any additional context..."
                        />
                    </div>

                    {/* Validation Errors */}
                    {formErrors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-red-800 mb-1">Please fix the following issues:</h4>
                                    <ul className="text-sm text-red-700 space-y-1">
                                        {formErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Business Rules Warning */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-blue-800 mb-1">Negotiation Guidelines:</h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• Price reductions are limited to 50% of baseline</li>
                                    <li>• Quantity increases are limited to 500% of baseline</li>
                                    <li>• Offers expire after 7 days</li>
                                    <li>• Maximum 5 negotiation rounds per product</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={!isValid || submitting}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? 'Submitting Offer...' : 'Submit Offer'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default OfferFormModal;