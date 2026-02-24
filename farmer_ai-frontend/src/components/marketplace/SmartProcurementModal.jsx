import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, ArrowRight, Loader2, X, AlertTriangle } from 'lucide-react';
import { negotiationAPI } from '../../services/negotiationApi';
import toast from 'react-hot-toast';

const SmartProcurementModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1 = Input, 2 = Loading, 3 = Preview, 4 = Success
    const [intent, setIntent] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [confirming, setConfirming] = useState(false);

    if (!isOpen) return null;

    const handlePreview = async () => {
        if (!intent.trim()) {
            toast.error('Please describe what you want to buy.');
            return;
        }

        setStep(2);
        try {
            const result = await negotiationAPI.previewAutoRfq(intent);
            if (result.success && result.data) {
                setPreviewData(result.data);
                setStep(3);
            } else {
                throw new Error('Invalid response from AI engine');
            }
        } catch (error) {
            console.error('Failed to preview RFQ:', error);
            toast.error('Failed to process intent. Please try again.');
            setStep(1);
        }
    };

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            const result = await negotiationAPI.confirmAutoRfq(previewData);
            if (result.success) {
                toast.success(`Successfully dispatched ${result.negotiation_threads_created} RFQs!`);
                setStep(4);
            } else {
                throw new Error('Failed to dispatch RFQs');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to dispatch RFQs. Please try again.');
            setConfirming(false);
        }
    };

    const handleClose = () => {
        if (step === 4 && onSuccess) {
            onSuccess();
        }
        // Reset state
        setStep(1);
        setIntent('');
        setPreviewData(null);
        setConfirming(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${step === 1 ? 'max-w-xl w-full h-auto' :
                step === 2 ? 'max-w-md w-full py-12' :
                    step === 4 ? 'max-w-md w-full py-10' :
                        'max-w-4xl w-full h-[85vh]'
                }`}>

                {/* Header (Hidden in Success/Loading states) */}
                {step !== 2 && step !== 4 && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                                <Sparkles size={22} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                    AI Procurement Assistant
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Beta</span>
                                </h3>
                                <p className="text-xs text-gray-500">Auto-generate RFQs from natural language</p>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-400">
                            <X size={20} />
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">

                    {/* STEP 1: INPUT */}
                    {step === 1 && (
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                    Describe what you're looking to buy. Our AI will parse your requirements, analyze live market prices, find the best suppliers, and draft customized negotiation offers instantly.
                                </p>
                                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4">
                                    <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Sparkles size={14} /> Example Query
                                    </h4>
                                    <p className="text-sm italic text-blue-600">
                                        "I need 50 tons of premium wheat delivered to Pune by next Friday under ₹2500 per quintal."
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    className="w-full h-32 p-4 pt-5 pb-12 bg-white border-2 border-slate-200 rounded-2xl text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all resize-none shadow-sm text-base leading-relaxed"
                                    placeholder="Type your procurement request here..."
                                    value={intent}
                                    onChange={(e) => setIntent(e.target.value)}
                                />
                                <button
                                    onClick={handlePreview}
                                    disabled={!intent.trim()}
                                    className="absolute bottom-3 right-3 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
                                >
                                    Analyze <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: LOADING */}
                    {step === 2 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                                <div className="w-20 h-20 bg-white border flex items-center justify-center rounded-3xl shadow-xl relative z-10">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">AI is thinking...</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto animate-pulse">
                                    Parsing intent, validating market prices, and drafting negotiation strategies...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PREVIEW */}
                    {step === 3 && previewData && (
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Left Panel: Analysis */}
                            <div className="w-full md:w-1/3 bg-slate-50 border-r border-gray-100 p-6 flex flex-col gap-6">

                                {/* Parsed Intent */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Extracted Parameters</h4>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-xs text-gray-500">Product</span>
                                            <span className="text-sm font-semibold text-gray-900">{previewData.parsed_intent.product_name || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-xs text-gray-500">Quantity</span>
                                            <span className="text-sm font-semibold text-gray-900">{previewData.parsed_intent.quantity} {previewData.parsed_intent.unit}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-xs text-gray-500">Target Price</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {previewData.parsed_intent.max_price_per_unit ? `₹${previewData.parsed_intent.max_price_per_unit}` : 'Not Spec.'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <span className="text-xs text-gray-500">Location</span>
                                            <span className="text-sm font-medium text-gray-700 text-right max-w-[120px] truncate">{previewData.parsed_intent.delivery_location || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-1">
                                            <span className="text-xs text-gray-500">Deadline</span>
                                            <span className="text-sm font-medium text-gray-700 text-right max-w-[120px] truncate">{previewData.parsed_intent.delivery_deadline || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Market Intel */}
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Market Intelligence</h4>

                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <TrendingUp size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Market Average</p>
                                                <p className="text-lg font-bold text-gray-900">₹{previewData.market_analysis.market_average}</p>
                                            </div>
                                        </div>

                                        <div className={`p-3 rounded-xl flex gap-3 items-start border ${previewData.risk_assessment === 'High' ? 'bg-red-50 border-red-100' :
                                            previewData.risk_assessment === 'Medium' ? 'bg-amber-50 border-amber-100' :
                                                'bg-emerald-50 border-emerald-100'
                                            }`}>
                                            <AlertTriangle size={18} className={`shrink-0 mt-0.5 ${previewData.risk_assessment === 'High' ? 'text-red-500' :
                                                previewData.risk_assessment === 'Medium' ? 'text-amber-500' :
                                                    'text-emerald-500'
                                                }`} />
                                            <div>
                                                <p className={`text-xs font-bold mb-0.5 ${previewData.risk_assessment === 'High' ? 'text-red-800' :
                                                    previewData.risk_assessment === 'Medium' ? 'text-amber-800' :
                                                        'text-emerald-800'
                                                    }`}>
                                                    {previewData.risk_assessment} Risk
                                                </p>
                                                <p className={`text-[11px] leading-tight ${previewData.risk_assessment === 'High' ? 'text-red-600' :
                                                    previewData.risk_assessment === 'Medium' ? 'text-amber-600' :
                                                        'text-emerald-600'
                                                    }`}>
                                                    {previewData.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel: Suppliers & RFQs */}
                            <div className="w-full md:w-2/3 p-6 flex flex-col h-full bg-white">
                                <div className="mb-4">
                                    <h4 className="text-lg font-bold text-gray-900">Generated RFQs</h4>
                                    <p className="text-sm text-gray-500">Found {previewData.supplier_rankings.length} matching suppliers. Review auto-drafted messages below.</p>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 pb-24">
                                    {previewData.supplier_rankings.map((supplier, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                            {/* Card Header */}
                                            <div className="bg-slate-50 p-4 border-b border-gray-200 flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">Match: {supplier.match_score}%</span>
                                                        <h5 className="font-bold text-gray-900">{supplier.vendor_name}</h5>
                                                    </div>
                                                    <p className="text-xs text-gray-500 flex items-center gap-3">
                                                        <span>Price: ₹{supplier.listing_price}</span>
                                                        <span>•</span>
                                                        <span>Available: {supplier.available_quantity}</span>
                                                        <span>•</span>
                                                        <span>{supplier.location}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${supplier.strategy === 'Direct Acceptance Offer' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        supplier.strategy === 'Counter Proposal' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {supplier.strategy}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* RFQ Draft */}
                                            <div className="p-4 bg-white relative">
                                                <div className="absolute top-4 right-4 text-gray-300">
                                                    <Sparkles size={20} />
                                                </div>
                                                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pr-8 font-serif">
                                                    "{supplier.rfq_message}"
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {previewData.supplier_rankings.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No matching suppliers found for this product.
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Action Bar */}
                                <div className="absolute bottom-0 right-0 w-full md:w-2/3 p-4 bg-white border-t border-gray-100 z-10 flex gap-3 justify-end rounded-br-3xl">
                                    <button
                                        onClick={() => setStep(1)}
                                        disabled={confirming}
                                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
                                    >
                                        Edit Intent
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={confirming || previewData.supplier_rankings.length === 0}
                                        className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
                                    >
                                        {confirming ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                        {confirming ? 'Dispatching...' : `Dispatch ${previewData.supplier_rankings.length} RFQs`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: SUCCESS */}
                    {step === 4 && (
                        <div className="flex flex-col items-center justify-center p-8 h-full space-y-6 text-center">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                                <CheckCircle2 size={48} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">RFQs Dispatched!</h3>
                                <p className="text-gray-500 max-w-sm mb-6">
                                    The AI has successfully created negotiation threads and sent your customized offers to the matched suppliers.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full"
                                >
                                    View My Negotiations
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SmartProcurementModal;
