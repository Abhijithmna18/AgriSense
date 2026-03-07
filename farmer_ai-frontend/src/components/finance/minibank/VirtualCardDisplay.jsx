import React, { useState } from 'react';
import { CreditCard, Lock, Unlock, Eye, EyeOff, DollarSign, Plus } from 'lucide-react';

const VirtualCardDisplay = ({ card, onFreeze, onSetLimit, onGenerate }) => {
    const [showCVV, setShowCVV] = useState(false);

    if (!card) {
        return (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                <h4 className="font-bold text-slate-900 mb-4">Virtual Card</h4>
                <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-slate-600 mb-4">No virtual card yet</p>
                    <button
                        onClick={onGenerate}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 mx-auto font-medium shadow-lg shadow-purple-200"
                    >
                        <Plus className="w-5 h-5" />
                        Generate Virtual Card
                    </button>
                    <p className="text-xs text-slate-500 mt-3">
                        Free • Instant • Secure online payments
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-900">Virtual Card</h4>
                {card.status === 'frozen' && (
                    <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Frozen
                    </span>
                )}
                {card.status === 'active' && (
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                        Active
                    </span>
                )}
            </div>
            
            {/* Card Display */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-xl p-6 text-white mb-4 shadow-xl relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="text-xs opacity-90 mb-1">AgriSense Bank</div>
                            <div className="text-xs opacity-75">Virtual Debit Card</div>
                        </div>
                        <CreditCard className="w-10 h-10 opacity-90" />
                    </div>
                    
                    <div className="mb-6">
                        <div className="text-xs opacity-75 mb-2">Card Number</div>
                        <div className="text-xl font-mono tracking-widest">
                            {card.cardNumber || '****-****-****-****'}
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div className="flex-1">
                            <div className="text-xs opacity-75 mb-1">Card Holder</div>
                            <div className="font-semibold text-sm uppercase tracking-wide">
                                {card.holderName || 'CARDHOLDER NAME'}
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <div className="text-xs opacity-75 mb-1">Expires</div>
                                <div className="font-semibold">{card.expiryDate || 'MM/YY'}</div>
                            </div>
                            <div>
                                <div className="text-xs opacity-75 mb-1">CVV</div>
                                <div className="flex items-center gap-2">
                                    <div className="font-semibold font-mono">
                                        {showCVV ? (card.cvv || '***') : '***'}
                                    </div>
                                    <button
                                        onClick={() => setShowCVV(!showCVV)}
                                        className="p-1 hover:bg-white/20 rounded transition-colors"
                                    >
                                        {showCVV ? (
                                            <EyeOff className="w-3 h-3" />
                                        ) : (
                                            <Eye className="w-3 h-3" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Card Info */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Daily Spending Limit</span>
                    <span className="font-bold text-slate-900">
                        ₹{(card.limit || 0).toLocaleString('en-IN')}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Card Status</span>
                    <span className={`font-semibold ${
                        card.status === 'active' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {card.status === 'active' ? 'Active' : 'Frozen'}
                    </span>
                </div>
            </div>
            
            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => onFreeze(card.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                        card.status === 'frozen'
                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
                    }`}
                >
                    {card.status === 'frozen' ? (
                        <>
                            <Unlock className="w-4 h-4" />
                            <span>Unfreeze</span>
                        </>
                    ) : (
                        <>
                            <Lock className="w-4 h-4" />
                            <span>Freeze Card</span>
                        </>
                    )}
                </button>
                <button
                    onClick={() => onSetLimit(card.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-200"
                >
                    <DollarSign className="w-4 h-4" />
                    <span>Set Limit</span>
                </button>
            </div>
            
            {/* Security Note */}
            <div className="mt-4 text-xs text-slate-500 text-center">
                <Lock className="w-3 h-3 inline mr-1" />
                Your card details are encrypted and secure
            </div>
        </div>
    );
};

export default VirtualCardDisplay;
