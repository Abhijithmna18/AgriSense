import React from 'react';
import { Droplets, Zap } from 'lucide-react';

const StepWater = ({ data, updateData }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700">
                    <Droplets size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--admin-text-primary)]">Water & Constraints</h2>
                    <p className="text-sm text-[var(--admin-text-secondary)]">Understanding water availability helps prevent crop stress.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Water Availability
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {['Low', 'Medium', 'High'].map(level => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => updateData(prev => ({ ...prev, waterAvailability: level }))}
                                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-center ${data.waterAvailability === level
                                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-500'
                                        : 'border-[var(--admin-border)] hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Seasonal Reliability
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Stable', 'Uncertain'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => updateData(prev => ({ ...prev, waterReliability: type }))}
                                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-center ${data.waterReliability === type
                                        ? 'border-cyan-500 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-500'
                                        : 'border-[var(--admin-border)] hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        <b>Stable:</b> Consistently available throughout the season.<br />
                        <b>Uncertain:</b> Dependent on monsoons or erratic supply.
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${data.hasPowerForIrrigation ? 'bg-[var(--admin-accent)] border-transparent' : 'border-gray-300 bg-white'}`}>
                            {data.hasPowerForIrrigation && <Zap size={14} className="text-white" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={data.hasPowerForIrrigation}
                            onChange={(e) => updateData(prev => ({ ...prev, hasPowerForIrrigation: e.target.checked }))}
                        />
                        <div>
                            <span className="font-medium text-gray-900">Power Availability for Irrigation</span>
                            <p className="text-xs text-gray-500">Do you have reliable electricity/fuel for pumps?</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default StepWater;
