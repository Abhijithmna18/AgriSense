import React, { useState } from 'react';
import { X, Calendar, DollarSign, Sprout, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFarmIntelligence } from '../../context/FarmIntelligenceContext';
import { analyzeCropViability } from '../../services/decisionSupportApi';
import toast from 'react-hot-toast';

const AddCropCycleModal = ({ isOpen, onClose }) => {
    const { addCropCycle, loading, selectedFarm } = useFarmIntelligence();
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [formData, setFormData] = useState({
        cropName: '',
        sowingDate: '',
        expectedHarvestDate: '',
        inputType: 'Chemical', // Default
        estimatedCost: '',
        status: 'Active'
    });

    if (!isOpen) return null;

    const handleAnalyze = async () => {
        if (!formData.cropName || !formData.sowingDate) {
            toast.error("Please enter Crop Name and Sowing Date first.");
            return;
        }

        setAnalyzing(true);
        setAnalysisResult(null);

        try {
            // Construct payload from available context
            const payload = {
                farmDetails: {
                    location: selectedFarm?.location?.district || "Unknown Region",
                    soil: selectedFarm?.soilType || "Generic Soil",
                    area_acres: selectedFarm?.totalArea || 0
                },
                cropDetails: {
                    crop_id: formData.cropName,
                    season: "Current" // Could derive from date
                },
                constraints: {
                    budget: formData.estimatedCost || 50000
                }
            };

            const result = await analyzeCropViability(payload);
            setAnalysisResult(result);

            // Auto-fill cost if available and zero
            if (!formData.estimatedCost && result.cost_estimation?.total_cost) {
                setFormData(prev => ({ ...prev, estimatedCost: result.cost_estimation.total_cost }));
                toast.success("Cost estimate auto-filled!");
            }

        } catch (error) {
            toast.error("Analysis unavailable (AI Engine offline)");
            console.warn("Analysis failed", error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Block high risk if critical (optional rule, just showing warning for now)
        if (analysisResult?.summary?.decision === 'NOT_RECOMMENDED') {
            if (!window.confirm("AI recommends AGAINST this crop cycle. Are you sure you want to proceed?")) {
                return;
            }
        }

        const success = await addCropCycle({
            ...formData,
            estimatedCost: Number(formData.estimatedCost) || 0,
            aiAnalysis: analysisResult // Save analysis with the cycle if backend supports it
        });
        if (success) {
            setFormData({
                cropName: '',
                sowingDate: '',
                expectedHarvestDate: '',
                inputType: 'Chemical',
                estimatedCost: '',
                status: 'Active'
            });
            setAnalysisResult(null);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Sprout size={20} className="text-green-600" />
                        New Crop Cycle
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 border-none">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Crop Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Wheat, Tomato"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                            value={formData.cropName}
                            onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sowing Date</label>
                            <input
                                type="date"
                                required
                                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                value={formData.sowingDate}
                                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Est. Harvest</label>
                            <input
                                type="date"
                                required
                                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                value={formData.expectedHarvestDate}
                                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Input Type</label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                value={formData.inputType}
                                onChange={(e) => setFormData({ ...formData, inputType: e.target.value })}
                            >
                                <option value="Chemical">Chemical</option>
                                <option value="Organic">Organic</option>
                                <option value="Mixed">Mixed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Est. Cost (₹)</label>
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500 text-sm"
                                value={formData.estimatedCost}
                                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
                                <Activity size={14} /> AI Risk & Profit Engine
                            </span>
                            <button
                                type="button"
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {analyzing ? 'Checking...' : 'Check Viability'}
                            </button>
                        </div>

                        {analysisResult && (
                            <div className="space-y-2 text-sm animate-in fade-in">
                                <div className="flex justify-between border-b border-blue-200 pb-1">
                                    <span className="text-gray-600">Decision:</span>
                                    <span className={`font-bold ${analysisResult.summary.decision === 'RECOMMENDED' ? 'text-green-600' :
                                            analysisResult.summary.decision === 'NOT_RECOMMENDED' ? 'text-red-600' : 'text-amber-600'
                                        }`}>
                                        {analysisResult.summary.decision.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Est. Profit:</span>
                                    <span className="font-mono font-medium text-gray-800">₹{analysisResult.profitability?.expected_profit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Risk Score:</span>
                                    <span className="font-mono font-medium text-gray-800">{analysisResult.risk_analysis?.overall_risk_score}/1.0</span>
                                </div>
                                {analysisResult.recommendations?.length > 0 && (
                                    <div className="mt-2 text-xs text-slate-600 bg-white p-2 rounded">
                                        💡 {analysisResult.recommendations[0]}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Start Cycle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCropCycleModal;
