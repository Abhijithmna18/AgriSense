import React, { useState } from 'react';
import { X, Calendar, DollarSign, Sprout } from 'lucide-react';
import { useFarmIntelligence } from '../../context/FarmIntelligenceContext';

const AddCropCycleModal = ({ isOpen, onClose }) => {
    const { addCropCycle, loading } = useFarmIntelligence();
    const [formData, setFormData] = useState({
        cropName: '',
        sowingDate: '',
        expectedHarvestDate: '',
        inputType: 'Chemical', // Default
        estimatedCost: '',
        status: 'Active'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await addCropCycle({
            ...formData,
            estimatedCost: Number(formData.estimatedCost) || 0
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
