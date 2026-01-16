import React, { useState, useEffect } from 'react';
import { Calendar, Edit2, Save, X, Sparkles } from 'lucide-react';
import { getLifecycle, updateLifecycleStage, setActiveStage } from '../../../services/mockDataService';
import { getAdvisory } from '../../../services/mockOllamaService';

const STAGES = ['Sowing', 'Germination', 'Vegetative', 'Flowering', 'Harvest'];

const LifecycleTab = ({ zone }) => {
    const [lifecycle, setLifecycle] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ date: '', notes: '' });
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        loadLifecycle();
    }, [zone._id]);

    const loadLifecycle = () => {
        const data = getLifecycle(zone._id);
        setLifecycle(data);
    };

    const handleActivateStage = async (stageName) => {
        const updatedStage = setActiveStage(zone._id, stageName);
        loadLifecycle();

        // Get AI advisory for this stage
        setLoadingAI(true);
        try {
            const advisory = await getAdvisory({
                crop: zone.crop_name,
                stage: stageName,
                weather: { precipitation: 12 },
                sensors: zone.current_sensors,
                diaryNotes: []
            });

            // Update stage with AI advisory
            updateLifecycleStage(updatedStage.id, {
                aiAdvisory: advisory.recommendation
            });
            loadLifecycle();
        } catch (error) {
            console.error('Error getting AI advisory:', error);
        } finally {
            setLoadingAI(false);
        }
    };

    const handleEdit = (stage) => {
        setEditingId(stage.id);
        setEditData({
            date: stage.date ? stage.date.split('T')[0] : new Date().toISOString().split('T')[0],
            notes: stage.notes || ''
        });
    };

    const handleSave = () => {
        updateLifecycleStage(editingId, {
            date: editData.date,
            notes: editData.notes
        });
        setEditingId(null);
        loadLifecycle();
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditData({ date: '', notes: '' });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Crop Lifecycle Timeline</h3>
                <p className="text-sm text-gray-600">Track your crop's progress through each growth stage</p>
            </div>

            {/* Horizontal Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-8">
                    {lifecycle.map((stage, index) => {
                        const isActive = stage.isActive;
                        const isCompleted = stage.date && !isActive;
                        const stageIndex = STAGES.indexOf(stage.stage);

                        return (
                            <React.Fragment key={stage.id}>
                                {/* Stage Node */}
                                <div className="flex flex-col items-center">
                                    <button
                                        onClick={() => !isActive && handleActivateStage(stage.stage)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isActive
                                                ? 'bg-green-600 text-white ring-4 ring-green-200'
                                                : isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                            }`}
                                        title={`Click to activate ${stage.stage}`}
                                    >
                                        {isCompleted ? '✓' : stageIndex + 1}
                                    </button>
                                    <span className={`mt-2 text-xs font-medium ${isActive ? 'text-green-700' : 'text-gray-600'
                                        }`}>
                                        {stage.stage}
                                    </span>
                                    {stage.date && (
                                        <span className="text-xs text-gray-500 mt-1">
                                            {new Date(stage.date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Connector Line */}
                                {index < lifecycle.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Active Stage Details */}
                {lifecycle.map(stage => stage.isActive && (
                    <div key={stage.id} className="border-t border-gray-200 pt-6">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-semibold text-gray-800">{stage.stage} Stage</h4>
                            {editingId !== stage.id && (
                                <button
                                    onClick={() => handleEdit(stage)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                            )}
                        </div>

                        {editingId === stage.id ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editData.date}
                                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={editData.notes}
                                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                                        placeholder="Add notes about this stage..."
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                        <Save size={16} />
                                        Save
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Date Started</p>
                                    <p className="font-medium text-gray-800">
                                        {stage.date ? new Date(stage.date).toLocaleDateString() : 'Not set'}
                                    </p>
                                </div>

                                {stage.notes && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Notes</p>
                                        <p className="text-gray-800">{stage.notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI Advisory */}
                        <div className="mt-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Sparkles size={20} className="text-emerald-600" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-semibold text-emerald-900 mb-1">
                                        AI Recommendation (Advisory Only)
                                    </h5>
                                    {loadingAI ? (
                                        <p className="text-sm text-emerald-700 italic">Analyzing crop stage...</p>
                                    ) : stage.aiAdvisory ? (
                                        <p className="text-sm text-emerald-800">{stage.aiAdvisory}</p>
                                    ) : (
                                        <p className="text-sm text-emerald-700 italic">
                                            Click on a stage to generate AI advisory
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LifecycleTab;
