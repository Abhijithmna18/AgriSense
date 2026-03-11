import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import adminApi from '../../services/adminApi';
import { Plus, ToggleLeft, ToggleRight, Edit2, Trash2, Search, Filter, X, Calendar, User, Globe } from 'lucide-react';

const FeatureFlagsAdmin = () => {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [environmentFilter, setEnvironmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        key: '',
        description: '',
        isEnabled: false,
        environment: 'production',
        rolloutPercentage: 100,
        targetRoles: []
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchFlags();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, search, environmentFilter, statusFilter]);

    const fetchFlags = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/admin/feature-flags', {
                params: { page, search, environment: environmentFilter, status: statusFilter, limit: 10 }
            });
            setFlags(res.data.flags || []);
            setPagination({
                currentPage: Number(res.data.currentPage),
                totalPages: Number(res.data.totalPages)
            });
        } catch (error) {
            console.error("Failed to fetch flags", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (flag) => {
        try {
            await adminApi.patch(`/admin/feature-flags/${flag._id}/toggle`);
            fetchFlags();
        } catch (error) {
            console.error("Failed to toggle flag", error);
            alert(error.response?.data?.message || 'Failed to toggle flag');
        }
    };

    const handleEdit = (flag) => {
        setSelectedFlag(flag);
        setFormData({
            name: flag.name,
            key: flag.key,
            description: flag.description,
            isEnabled: flag.isEnabled,
            environment: flag.environment,
            rolloutPercentage: flag.rolloutPercentage,
            targetRoles: flag.targetRoles || []
        });
        setIsEditModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedFlag(null);
        setFormData({
            name: '',
            key: '',
            description: '',
            isEnabled: false,
            environment: 'production',
            rolloutPercentage: 100,
            targetRoles: []
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminApi.post('/admin/feature-flags', formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchFlags();
        } catch (error) {
            console.error("Failed to create flag", error);
            alert(error.response?.data?.message || 'Failed to create flag');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminApi.put(`/admin/feature-flags/${selectedFlag._id}`, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchFlags();
        } catch (error) {
            console.error("Failed to update flag", error);
            alert(error.response?.data?.message || 'Failed to update flag');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await adminApi.delete(`/admin/feature-flags/${selectedFlag._id}`);
            setIsDeleteModalOpen(false);
            setSelectedFlag(null);
            fetchFlags();
        } catch (error) {
            console.error("Failed to delete flag", error);
            alert(error.response?.data?.message || 'Failed to delete flag');
        }
    };

    const openDeleteModal = (flag) => {
        setSelectedFlag(flag);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            key: '',
            description: '',
            isEnabled: false,
            environment: 'production',
            rolloutPercentage: 100,
            targetRoles: []
        });
        setSelectedFlag(null);
    };

    const toggleRole = (role) => {
        setFormData(prev => ({
            ...prev,
            targetRoles: prev.targetRoles.includes(role)
                ? prev.targetRoles.filter(r => r !== role)
                : [...prev.targetRoles, role]
        }));
    };

    const getEnvironmentBadge = (env) => {
        const styles = {
            production: 'bg-green-500/10 text-green-500 border-green-500/20',
            staging: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            development: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            all: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
        };
        return styles[env] || styles.production;
    };

    const columns = [
        {
            key: 'name',
            title: 'Flag Name',
            render: (row) => (
                <div>
                    <span className="font-semibold text-[var(--admin-text-primary)]">{row.name}</span>
                    <div className="text-xs font-mono text-[var(--admin-accent)] mt-0.5">{row.key}</div>
                </div>
            )
        },
        {
            key: 'description',
            title: 'Description',
            render: (row) => (
                <span className="text-[var(--admin-text-secondary)] text-sm">{row.description}</span>
            )
        },
        {
            key: 'isEnabled',
            title: 'Status',
            render: (row) => (
                <button
                    onClick={() => handleToggle(row)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                        row.isEnabled
                            ? 'bg-[var(--admin-success)]/10 text-[var(--admin-success)] border-[var(--admin-success)]/20 hover:bg-[var(--admin-success)]/20'
                            : 'bg-[var(--admin-bg-hover)] text-[var(--admin-text-muted)] border-[var(--admin-border)] hover:bg-[var(--admin-bg-secondary)]'
                    }`}
                >
                    {row.isEnabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    <span className="text-xs font-medium">{row.isEnabled ? 'ON' : 'OFF'}</span>
                </button>
            )
        },
        {
            key: 'environment',
            title: 'Environment',
            render: (row) => (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getEnvironmentBadge(row.environment)}`}>
                    {row.environment.charAt(0).toUpperCase() + row.environment.slice(1)}
                </span>
            )
        },
        {
            key: 'rolloutPercentage',
            title: 'Rollout',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-20 bg-[var(--admin-bg-hover)] rounded-full h-2">
                        <div
                            className="bg-[var(--admin-accent)] h-2 rounded-full transition-all"
                            style={{ width: `${row.rolloutPercentage}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-[var(--admin-text-secondary)] font-medium">{row.rolloutPercentage}%</span>
                </div>
            )
        },
        {
            key: 'createdAt',
            title: 'Created',
            render: (row) => (
                <div className="flex items-center gap-1.5 text-[var(--admin-text-secondary)] text-sm">
                    <Calendar size={14} />
                    {new Date(row.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-accent)] transition-all"
                        title="Edit Flag"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => openDeleteModal(row)}
                        className="p-1.5 rounded-lg border border-[var(--admin-danger)]/20 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-all"
                        title="Delete Flag"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--admin-text-primary)]">Feature Flags</h1>
                    <p className="text-[var(--admin-text-muted)] text-sm mt-1">Control platform features dynamically</p>
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl hover:bg-[var(--admin-accent)]/90 transition-all shadow-sm font-medium"
                >
                    <Plus size={18} />
                    Create Flag
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search feature flags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all shadow-sm"
                    />
                </div>

                <select
                    value={environmentFilter}
                    onChange={(e) => setEnvironmentFilter(e.target.value)}
                    className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all shadow-sm"
                >
                    <option value="all">All Environments</option>
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all shadow-sm"
                >
                    <option value="">All Status</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                </select>
            </div>

            {/* Empty State */}
            {!loading && flags.length === 0 && !search && (
                <div className="admin-card text-center py-12">
                    <Globe size={48} className="mx-auto text-[var(--admin-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--admin-text-primary)] mb-2">No feature flags created yet</h3>
                    <p className="text-[var(--admin-text-muted)] mb-4">Create your first flag to control platform features</p>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-all"
                    >
                        <Plus size={18} />
                        Create Flag
                    </button>
                </div>
            )}

            {/* Feature Flags Table */}
            {(loading || flags.length > 0) && (
                <div className="admin-card overflow-hidden !p-0">
                    <DataTable
                        columns={columns}
                        data={flags}
                        isLoading={loading}
                        pagination={pagination}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            )}

            {/* Create Feature Flag Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--admin-bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[var(--admin-border)] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[var(--admin-text-primary)]">Create Feature Flag</h3>
                            <button
                                onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                                className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Flag Name <span className="text-[var(--admin-danger)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]"
                                        placeholder="e.g., AI Crop Predictions"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Key (unique identifier) <span className="text-[var(--admin-danger)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.key}
                                        onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-primary)] font-mono focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]"
                                        placeholder="e.g., ai_crop_predictions"
                                    />
                                    <p className="text-xs text-[var(--admin-text-muted)] mt-1">Use lowercase with underscores</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Description <span className="text-[var(--admin-danger)]">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] resize-none"
                                        rows="3"
                                        placeholder="Brief description of this feature flag"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                            Environment
                                        </label>
                                        <select
                                            value={formData.environment}
                                            onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                                            className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]"
                                        >
                                            <option value="production">Production</option>
                                            <option value="staging">Staging</option>
                                            <option value="development">Development</option>
                                            <option value="all">All</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                            Default Status
                                        </label>
                                        <label className="flex items-center gap-3 bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isEnabled}
                                                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                                                className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                                            />
                                            <span className="text-[var(--admin-text-primary)]">Enabled</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Rollout Percentage: {formData.rolloutPercentage}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={formData.rolloutPercentage}
                                        onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-[var(--admin-bg-primary)] rounded-lg appearance-none cursor-pointer accent-[var(--admin-accent)]"
                                    />
                                    <div className="flex justify-between text-xs text-[var(--admin-text-muted)] mt-1">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-3">
                                        Target Roles (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['farmer', 'buyer', 'vendor', 'admin'].map((role) => (
                                            <label key={role} className="flex items-center gap-2 bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-3 py-2 cursor-pointer hover:bg-[var(--admin-bg-hover)] transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.targetRoles.includes(role)}
                                                    onChange={() => toggleRole(role)}
                                                    className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                                                />
                                                <span className="text-sm text-[var(--admin-text-primary)] capitalize">{role}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-[var(--admin-text-muted)] mt-2">Leave empty to target all roles</p>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-[var(--admin-border)] flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateSubmit}
                                disabled={submitting}
                                className="px-6 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-all disabled:opacity-50 font-medium"
                            >
                                {submitting ? 'Creating...' : 'Create Flag'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Feature Flag Modal */}
            {isEditModalOpen && selectedFlag && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--admin-bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[var(--admin-border)] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[var(--admin-text-primary)]">Edit Feature Flag</h3>
                            <button
                                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                                className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Flag Name <span className="text-[var(--admin-danger)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Key (cannot be changed)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.key}
                                        disabled
                                        className="w-full bg-[var(--admin-bg-hover)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-muted)] font-mono cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Description <span className="text-[var(--admin-danger)]">*</span>
                                    </label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] resize-none"
                                        rows="3"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                            Environment
                                        </label>
                                        <select
                                            value={formData.environment}
                                            onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                                            className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]"
                                        >
                                            <option value="production">Production</option>
                                            <option value="staging">Staging</option>
                                            <option value="development">Development</option>
                                            <option value="all">All</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                            Status
                                        </label>
                                        <label className="flex items-center gap-3 bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isEnabled}
                                                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                                                className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                                            />
                                            <span className="text-[var(--admin-text-primary)]">Enabled</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Rollout Percentage: {formData.rolloutPercentage}%
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={formData.rolloutPercentage}
                                        onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-[var(--admin-bg-primary)] rounded-lg appearance-none cursor-pointer accent-[var(--admin-accent)]"
                                    />
                                    <div className="flex justify-between text-xs text-[var(--admin-text-muted)] mt-1">
                                        <span>0%</span>
                                        <span>50%</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-3">
                                        Target Roles (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['farmer', 'buyer', 'vendor', 'admin'].map((role) => (
                                            <label key={role} className="flex items-center gap-2 bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-3 py-2 cursor-pointer hover:bg-[var(--admin-bg-hover)] transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.targetRoles.includes(role)}
                                                    onChange={() => toggleRole(role)}
                                                    className="w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                                                />
                                                <span className="text-sm text-[var(--admin-text-primary)] capitalize">{role}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-[var(--admin-border)] flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                disabled={submitting}
                                className="px-6 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-all disabled:opacity-50 font-medium"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedFlag(null); }}
                onConfirm={handleDelete}
                title="Delete Feature Flag"
                message={`Are you sure you want to delete the feature flag "${selectedFlag?.name}"? This action cannot be undone.`}
                confirmText="Delete Flag"
                confirmColor="bg-[var(--admin-danger)]"
                requireInput={true}
                inputPlaceholder="DELETE"
            />
        </div>
    );
};

export default FeatureFlagsAdmin;
