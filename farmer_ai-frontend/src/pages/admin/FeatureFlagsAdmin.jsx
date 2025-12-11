import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import adminApi from '../../services/adminApi';
import { Plus, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react';

const FeatureFlagsAdmin = () => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFlag, setCurrentFlag] = useState(null); // For edit/create form

    // Form State
    const [formData, setFormData] = useState({ key: '', description: '', isEnabled: false, rolloutPercentage: 0 });

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            if (import.meta.env.VITE_USE_MOCK === 'true') {
                setFlags([
                    { _id: '1', key: 'new_dashboard', description: 'Enable the new dashboard layout', isEnabled: true, rolloutPercentage: 100 },
                    { _id: '2', key: 'ai_advisory_v2', description: 'Advanced AI model for advisory', isEnabled: false, rolloutPercentage: 0 },
                ]);
                setLoading(false);
                return;
            }
            const res = await adminApi.get('/admin/feature-flags');
            setFlags(res.data);
        } catch (error) {
            console.error("Failed to fetch flags", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (flag) => {
        setCurrentFlag(flag);
        setFormData({
            key: flag.key,
            description: flag.description,
            isEnabled: flag.isEnabled,
            rolloutPercentage: flag.rolloutPercentage
        });
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentFlag(null);
        setFormData({ key: '', description: '', isEnabled: false, rolloutPercentage: 0 });
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (import.meta.env.VITE_USE_MOCK === 'true') {
                alert('Mock: Feature Flag Saved');
                setIsEditing(false);
                fetchFlags();
                return;
            }

            await adminApi.post('/admin/feature-flags', formData);
            setIsEditing(false);
            fetchFlags();
        } catch (error) {
            console.error("Failed to save flag", error);
            alert("Error saving flag");
        }
    };

    const columns = [
        { key: 'key', title: 'Flag Key', render: (row) => <span className="font-mono text-blue-300">{row.key}</span> },
        { key: 'description', title: 'Description' },
        {
            key: 'isEnabled', title: 'Status', render: (row) => (
                row.isEnabled
                    ? <span className="text-green-400 flex items-center gap-1"><ToggleRight size={18} /> Enabled</span>
                    : <span className="text-gray-500 flex items-center gap-1"><ToggleLeft size={18} /> Disabled</span>
            )
        },
        {
            key: 'rolloutPercentage', title: 'Rollout', render: (row) => (
                <div className="w-full bg-gray-700 rounded-full h-2.5 max-w-[100px]">
                    <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${row.rolloutPercentage}%` }}
                    ></div>
                    <span className="text-xs text-gray-400 mt-1 block">{row.rolloutPercentage}%</span>
                </div>
            )
        },
        {
            key: 'actions', title: 'Actions', render: (row) => (
                <button
                    onClick={() => handleEdit(row)}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <Edit2 size={16} />
                </button>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FFD166] text-gray-900 rounded font-bold hover:bg-[#e0b040] transition-colors"
                >
                    <Plus size={18} /> Create Flag
                </button>
            </div>

            <DataTable columns={columns} data={flags} isLoading={loading} />

            {/* Edit/Create Modal - Inline for simplicity here, could be separate component */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold text-white mb-4">{currentFlag ? 'Edit Flag' : 'New Feature Flag'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Key (Snake Case)</label>
                                <input
                                    type="text"
                                    value={formData.key}
                                    onChange={e => setFormData({ ...formData, key: e.target.value })}
                                    disabled={!!currentFlag} // Key immutable on edit
                                    className="w-full bg-[#111827] border border-[#374151] rounded px-3 py-2 text-white font-mono"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#111827] border border-[#374151] rounded px-3 py-2 text-white"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-gray-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.isEnabled}
                                        onChange={e => setFormData({ ...formData, isEnabled: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    Enabled
                                </label>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Rollout Percentage ({formData.rolloutPercentage}%)</label>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={formData.rolloutPercentage}
                                    onChange={e => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-300 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeatureFlagsAdmin;
