import React from 'react';
import { Layers } from 'lucide-react';

const StepSoil = ({ data, updateData }) => {
    const handleTestChange = (e) => {
        const { name, value } = e.target;
        updateData(prev => ({
            ...prev,
            soilTest: { ...prev.soilTest, [name]: value }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700">
                    <Layers size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--admin-text-primary)]">Soil Information</h2>
                    <p className="text-sm text-[var(--admin-text-secondary)]">Accurate soil data significantly improves fertilizer recommendations.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Primary Soil Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['Sandy', 'Loamy', 'Clay', 'Black', 'Red', 'Mixed', 'Other'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => updateData(prev => ({ ...prev, soilType: type }))}
                                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${data.soilType === type
                                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                                        : 'border-[var(--admin-border)] hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-[var(--admin-border)]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Soil Test Data</h3>
                        <select
                            value={data.soilDataSource}
                            onChange={(e) => updateData(prev => ({ ...prev, soilDataSource: e.target.value }))}
                            className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-amber-500 focus:ring-amber-500"
                        >
                            <option value="Unknown">Data Not Available</option>
                            <option value="Estimated">Estimated / approximate</option>
                            <option value="Lab Tested">Lab Tested (Recommended)</option>
                        </select>
                    </div>

                    {data.soilDataSource !== 'Unknown' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nitrogen (N)</label>
                                <input
                                    type="number"
                                    name="n"
                                    placeholder="mg/kg"
                                    value={data.soilTest.n}
                                    onChange={handleTestChange}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phosphorus (P)</label>
                                <input
                                    type="number"
                                    name="p"
                                    placeholder="mg/kg"
                                    value={data.soilTest.p}
                                    onChange={handleTestChange}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Potassium (K)</label>
                                <input
                                    type="number"
                                    name="k"
                                    placeholder="mg/kg"
                                    value={data.soilTest.k}
                                    onChange={handleTestChange}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">pH Level</label>
                                <input
                                    type="number"
                                    name="ph"
                                    placeholder="0-14"
                                    step="0.1"
                                    value={data.soilTest.ph}
                                    onChange={handleTestChange}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic text-center py-2">
                            Select "Lab Tested" or "Estimated" to enter nutrient values.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StepSoil;
