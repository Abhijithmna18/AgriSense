import React, { useState } from 'react';
import { History, Plus, Trash2 } from 'lucide-react';

const StepHistory = ({ data, updateData }) => {
    const [newCrop, setNewCrop] = useState({
        cropName: '',
        sowingDate: '',
        harvestDate: '',
        yieldActual: ''
    });

    const addCrop = () => {
        if (!newCrop.cropName || !newCrop.sowingDate) return;

        updateData(prev => ({
            ...prev,
            cropHistory: [...prev.cropHistory, { ...newCrop, id: Date.now() }]
        }));

        setNewCrop({ cropName: '', sowingDate: '', harvestDate: '', yieldActual: '' });
    };

    const removeCrop = (id) => {
        updateData(prev => ({
            ...prev,
            cropHistory: prev.cropHistory.filter(c => c.id !== id)
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700">
                    <History size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--admin-text-primary)]">Crop History (Optional)</h2>
                    <p className="text-sm text-[var(--admin-text-secondary)]">Adding past crops helps AI understand your field's potential.</p>
                </div>
            </div>

            {/* List */}
            {data.cropHistory.length > 0 && (
                <div className="space-y-3 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700">Added Records</h3>
                    {data.cropHistory.map(crop => (
                        <div key={crop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <p className="font-bold text-gray-800">{crop.cropName}</p>
                                <p className="text-xs text-gray-500">
                                    Sown: {new Date(crop.sowingDate).toLocaleDateString()}
                                    {crop.yieldActual && ` • Yield: ${crop.yieldActual} kg`}
                                </p>
                            </div>
                            <button
                                onClick={() => removeCrop(crop.id)}
                                className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New */}
            <div className="p-5 bg-white border border-[var(--admin-border)] rounded-xl shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Add Past Crop Record</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Crop Name</label>
                        <input
                            type="text"
                            value={newCrop.cropName}
                            onChange={e => setNewCrop({ ...newCrop, cropName: e.target.value })}
                            placeholder="e.g. Rice, Wheat"
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Yield (kg, Optional)</label>
                        <input
                            type="number"
                            value={newCrop.yieldActual}
                            onChange={e => setNewCrop({ ...newCrop, yieldActual: e.target.value })}
                            placeholder="Total yield"
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Sowing Date</label>
                        <input
                            type="date"
                            value={newCrop.sowingDate}
                            onChange={e => setNewCrop({ ...newCrop, sowingDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Harvest Date</label>
                        <input
                            type="date"
                            value={newCrop.harvestDate}
                            onChange={e => setNewCrop({ ...newCrop, harvestDate: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>
                </div>
                <button
                    onClick={addCrop}
                    disabled={!newCrop.cropName || !newCrop.sowingDate}
                    className="mt-4 w-full py-2 bg-purple-50 text-purple-700 font-medium rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Add Record
                </button>
            </div>
        </div>
    );
};

export default StepHistory;
