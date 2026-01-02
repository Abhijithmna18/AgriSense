import React from 'react';
import { Sprout } from 'lucide-react';

const StepIdentity = ({ data, updateData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        updateData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-[var(--admin-accent)]">
                    <Sprout size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[var(--admin-text-primary)]">Basic Farm Identity</h2>
                    <p className="text-sm text-[var(--admin-text-secondary)]">Let's start with the basics of your farm.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Farm Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        placeholder="e.g. Green Valley Plot A"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Total Area (Hectares) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="totalArea"
                        value={data.totalArea}
                        onChange={handleChange}
                        step="0.1"
                        min="0.1"
                        placeholder="0.0"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Landholding Type
                    </label>
                    <select
                        name="landholdingType"
                        value={data.landholdingType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-emerald-100 outline-none transition-all bg-white"
                    >
                        <option value="Owner">Owner</option>
                        <option value="Tenant">Tenant</option>
                    </select>
                </div>

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">
                        Primary Irrigation Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Rainfed', 'Canal', 'Borewell', 'Drip', 'Sprinkler', 'Other'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => updateData(prev => ({ ...prev, irrigationType: type }))}
                                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${data.irrigationType === type
                                        ? 'border-[var(--admin-accent)] bg-emerald-50 text-[var(--admin-accent)] ring-1 ring-[var(--admin-accent)]'
                                        : 'border-[var(--admin-border)] hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepIdentity;
