import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Package, X } from 'lucide-react';
import {
    getHarvestLogs,
    createHarvestLog,
    updateHarvestLog,
    deleteHarvestLog
} from '../../../services/mockDataService';

const HarvestTab = ({ zone }) => {
    const [harvests, setHarvests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        expectedYield: '',
        actualYield: '',
        qualityGrade: '',
        harvestDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadHarvests();
    }, [zone._id]);

    const loadHarvests = () => {
        const data = getHarvestLogs(zone._id);
        setHarvests(data);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            updateHarvestLog(editingId, formData);
        } else {
            createHarvestLog(zone._id, formData);
        }

        resetForm();
        loadHarvests();
    };

    const handleEdit = (harvest) => {
        setEditingId(harvest.id);
        setFormData({
            expectedYield: harvest.expectedYield.toString(),
            actualYield: harvest.actualYield.toString(),
            qualityGrade: harvest.qualityGrade,
            harvestDate: harvest.harvestDate.split('T')[0]
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this harvest log?')) {
            deleteHarvestLog(id);
            loadHarvests();
        }
    };

    const resetForm = () => {
        setFormData({
            expectedYield: '',
            actualYield: '',
            qualityGrade: '',
            harvestDate: new Date().toISOString().split('T')[0]
        });
        setEditingId(null);
        setShowForm(false);
    };

    // Calculate summary
    const summary = harvests.reduce((acc, h) => ({
        totalExpected: acc.totalExpected + h.expectedYield,
        totalActual: acc.totalActual + h.actualYield
    }), { totalExpected: 0, totalActual: 0 });

    const overallDeviation = summary.totalExpected > 0
        ? ((summary.totalActual - summary.totalExpected) / summary.totalExpected) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {harvests.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Expected</p>
                        <p className="text-2xl font-bold text-gray-800">{summary.totalExpected.toFixed(0)} kg</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Actual</p>
                        <p className="text-2xl font-bold text-gray-800">{summary.totalActual.toFixed(0)} kg</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-600 mb-1">Overall Deviation</p>
                        <div className="flex items-center gap-2">
                            <p className={`text-2xl font-bold ${overallDeviation > 0 ? 'text-green-600' : overallDeviation < 0 ? 'text-red-600' : 'text-gray-800'
                                }`}>
                                {overallDeviation > 0 ? '+' : ''}{overallDeviation.toFixed(1)}%
                            </p>
                            {overallDeviation > 0 ? (
                                <TrendingUp size={20} className="text-green-600" />
                            ) : overallDeviation < 0 ? (
                                <TrendingDown size={20} className="text-red-600" />
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Harvest Logs</h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancel' : 'Log Harvest'}
                </button>
            </div>

            {/* Harvest Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Yield (kg) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.1"
                                value={formData.expectedYield}
                                onChange={(e) => setFormData({ ...formData, expectedYield: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                placeholder="1000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Actual Yield (kg) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.1"
                                value={formData.actualYield}
                                onChange={(e) => setFormData({ ...formData, actualYield: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                placeholder="1150"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quality Grade
                            </label>
                            <input
                                type="text"
                                value={formData.qualityGrade}
                                onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                placeholder="Grade A"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Harvest Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.harvestDate}
                                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            {editingId ? 'Update Log' : 'Add Log'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Harvest History */}
            <div className="space-y-3">
                {harvests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                        <Package size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No harvest logs yet. Add your first harvest record.</p>
                    </div>
                ) : (
                    harvests.map(harvest => (
                        <div
                            key={harvest.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(harvest.harvestDate).toLocaleDateString()}
                                    </p>
                                    {harvest.qualityGrade && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Quality: <span className="font-medium">{harvest.qualityGrade}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(harvest)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(harvest.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Expected</p>
                                    <p className="font-semibold text-gray-800">{harvest.expectedYield} kg</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Actual</p>
                                    <p className="font-semibold text-gray-800">{harvest.actualYield} kg</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Deviation</p>
                                    <p className={`font-semibold flex items-center gap-1 ${harvest.deviation > 0 ? 'text-green-600' :
                                        harvest.deviation < 0 ? 'text-red-600' :
                                            'text-gray-800'
                                        }`}>
                                        {harvest.deviation > 0 ? '+' : ''}{harvest.deviation}%
                                        {harvest.deviation > 0 && <TrendingUp size={14} />}
                                        {harvest.deviation < 0 && <TrendingDown size={14} />}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HarvestTab;
