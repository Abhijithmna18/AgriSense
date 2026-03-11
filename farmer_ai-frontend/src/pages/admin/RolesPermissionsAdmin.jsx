import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, Users, Calendar, Eye, X } from 'lucide-react';
import adminApi from '../../services/adminApi';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';

const RolesPermissionsAdmin = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: []
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRoles();
        }, 300);
        return () => clearTimeout(timer);
    }, [page, search]);

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/admin/roles', {
                params: { page, search, limit: 10 }
            });
            setRoles(res.data.roles);
            setPagination({
                currentPage: Number(res.data.currentPage),
                totalPages: Number(res.data.totalPages)
            });
        } catch (error) {
            console.error('Failed to fetch roles', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await adminApi.get('/admin/roles/permissions/all');
            setPermissions(res.data);
        } catch (error) {
            console.error('Failed to fetch permissions', error);
        }
    };

    const handleCreateRole = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminApi.post('/admin/roles', formData);
            setIsCreateModalOpen(false);
            resetForm();
            fetchRoles();
        } catch (error) {
            console.error('Failed to create role', error);
            alert(error.response?.data?.message || 'Failed to create role');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditRole = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminApi.put(`/admin/roles/${selectedRole._id}`, formData);
            setIsEditModalOpen(false);
            resetForm();
            fetchRoles();
        } catch (error) {
            console.error('Failed to update role', error);
            alert(error.response?.data?.message || 'Failed to update role');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRole = async () => {
        try {
            await adminApi.delete(`/admin/roles/${selectedRole._id}`);
            setIsDeleteModalOpen(false);
            setSelectedRole(null);
            fetchRoles();
        } catch (error) {
            console.error('Failed to delete role', error);
            alert(error.response?.data?.message || 'Failed to delete role');
        }
    };

    const openEditModal = (role) => {
        setSelectedRole(role);
        setFormData({
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(p => p._id)
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (role) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    const openViewModal = (role) => {
        setSelectedRole(role);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            permissions: []
        });
        setSelectedRole(null);
    };

    const togglePermission = (permissionId) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter(id => id !== permissionId)
                : [...prev.permissions, permissionId]
        }));
    };

    const columns = [
        {
            key: 'name',
            title: 'Role',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-[var(--admin-accent)]" />
                    <div>
                        <span className="font-semibold text-[var(--admin-text-primary)]">{row.name}</span>
                        {row.isSystem && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] rounded">System</span>
                        )}
                    </div>
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
            key: 'userCount',
            title: 'Users',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-[var(--admin-text-muted)]" />
                    <span className="text-[var(--admin-text-primary)] font-medium">{row.userCount || 0}</span>
                </div>
            )
        },
        {
            key: 'permissions',
            title: 'Permissions',
            render: (row) => (
                <span className="text-[var(--admin-text-primary)] font-medium">{row.permissions?.length || 0}</span>
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
                        onClick={() => openViewModal(row)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-accent)] transition-all"
                        title="View Permissions"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => openEditModal(row)}
                        className="p-1.5 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-accent)] transition-all"
                        title="Edit Role"
                        disabled={row.isSystem}
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => openDeleteModal(row)}
                        className="p-1.5 rounded-lg border border-[var(--admin-danger)]/20 text-[var(--admin-danger)] hover:bg-[var(--admin-danger)]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Role"
                        disabled={row.isSystem}
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
                    <h1 className="text-2xl font-bold text-[var(--admin-text-primary)]">Roles & Permissions</h1>
                    <p className="text-[var(--admin-text-muted)] text-sm mt-1">Manage system roles and user access levels</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search roles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-72 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-accent)] text-white rounded-xl hover:bg-[var(--admin-accent)]/90 transition-all shadow-sm font-medium"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">Create Role</span>
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {!loading && roles.length === 0 && !search && (
                <div className="admin-card text-center py-12">
                    <Shield size={48} className="mx-auto text-[var(--admin-text-muted)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--admin-text-primary)] mb-2">No roles created yet</h3>
                    <p className="text-[var(--admin-text-muted)] mb-4">Create your first role to manage permissions</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-all"
                    >
                        <Plus size={18} />
                        Create Role
                    </button>
                </div>
            )}

            {/* Roles Table */}
            {(loading || roles.length > 0) && (
                <div className="admin-card overflow-hidden !p-0">
                    <DataTable
                        columns={columns}
                        data={roles}
                        isLoading={loading}
                        pagination={pagination}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            )}

            {/* Create Role Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--admin-bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[var(--admin-border)] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[var(--admin-text-primary)]">Create New Role</h3>
                            <button
                                onClick={() => { setIsCreateModalOpen(false); resetForm(); }}
                                className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateRole} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Role Name <span className="text-[var(--admin-danger)]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg px-4 py-2.5 text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)]"
                                        placeholder="e.g., Content Manager"
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
                                        placeholder="Brief description of this role"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-3">
                                        Permissions
                                    </label>
                                    <div className="space-y-4">
                                        {Object.entries(permissions).map(([module, perms]) => (
                                            <div key={module} className="bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg p-4">
                                                <h4 className="font-semibold text-[var(--admin-text-primary)] mb-3">{module}</h4>
                                                <div className="space-y-2">
                                                    {perms.map((permission) => (
                                                        <label key={permission._id} className="flex items-start gap-3 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.permissions.includes(permission._id)}
                                                                onChange={() => togglePermission(permission._id)}
                                                                className="mt-1 w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                                                            />
                                                            <div className="flex-1">
                                                                <span className="text-sm text-[var(--admin-text-primary)] group-hover:text-[var(--admin-accent)] transition-colors">
                                                                    {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </span>
                                                                {permission.description && (
                                                                    <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{permission.description}</p>
                                                                )}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                                onClick={handleCreateRole}
                                disabled={submitting}
                                className="px-6 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-all disabled:opacity-50 font-medium"
                            >
                                {submitting ? 'Creating...' : 'Create Role'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {isEditModalOpen && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--admin-bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[var(--admin-border)] flex justify-between items-center">
                            <h3 className="text-xl font-bold text-[var(--admin-text-primary)]">Edit Role</h3>
                            <button
                                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                                className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditRole} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-2">
                                        Role Name <span className="text-[var(--admin-danger)]">*</span>
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

                                <div>
                                    <label className="block text-sm font-medium text-[var(--admin-text-primary)] mb-3">
                                        Permissions
                                    </label>
                                    <div className="space-y-4">
                                        {Object.entries(permissions).map(([module, perms]) => (
                                            <div key={module} className="bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg p-4">
                                                <h4 className="font-semibold text-[var(--admin-text-primary)] mb-3">{module}</h4>
                                                <div className="space-y-2">
                                                    {perms.map((permission) => (
                                                        <label key={permission._id} className="flex items-start gap-3 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.permissions.includes(permission._id)}
                                                                onChange={() => togglePermission(permission._id)}
                                                                className="mt-1 w-4 h-4 rounded border-[var(--admin-border)] text-[var(--admin-accent)] focus:ring-[var(--admin-accent)]"
                                                            />
                                                            <div className="flex-1">
                                                                <span className="text-sm text-[var(--admin-text-primary)] group-hover:text-[var(--admin-accent)] transition-colors">
                                                                    {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                </span>
                                                                {permission.description && (
                                                                    <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{permission.description}</p>
                                                                )}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
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
                                onClick={handleEditRole}
                                disabled={submitting}
                                className="px-6 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-all disabled:opacity-50 font-medium"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Permissions Modal */}
            {isViewModalOpen && selectedRole && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--admin-bg-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-[var(--admin-border)] flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-[var(--admin-text-primary)]">{selectedRole.name}</h3>
                                <p className="text-sm text-[var(--admin-text-muted)] mt-1">{selectedRole.description}</p>
                            </div>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            <div className="mb-4 flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-[var(--admin-text-muted)]" />
                                    <span className="text-[var(--admin-text-secondary)]">
                                        <span className="font-semibold text-[var(--admin-text-primary)]">{selectedRole.userCount || 0}</span> users assigned
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-[var(--admin-text-muted)]" />
                                    <span className="text-[var(--admin-text-secondary)]">
                                        <span className="font-semibold text-[var(--admin-text-primary)]">{selectedRole.permissions?.length || 0}</span> permissions
                                    </span>
                                </div>
                            </div>

                            {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(
                                        selectedRole.permissions.reduce((acc, perm) => {
                                            if (!acc[perm.module]) acc[perm.module] = [];
                                            acc[perm.module].push(perm);
                                            return acc;
                                        }, {})
                                    ).map(([module, perms]) => (
                                        <div key={module} className="bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] rounded-lg p-4">
                                            <h4 className="font-semibold text-[var(--admin-text-primary)] mb-3">{module}</h4>
                                            <div className="space-y-2">
                                                {perms.map((permission) => (
                                                    <div key={permission._id} className="flex items-start gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--admin-accent)] mt-2"></div>
                                                        <div>
                                                            <span className="text-sm text-[var(--admin-text-primary)]">
                                                                {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                            </span>
                                                            {permission.description && (
                                                                <p className="text-xs text-[var(--admin-text-muted)] mt-0.5">{permission.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-[var(--admin-text-muted)]">
                                    No permissions assigned to this role
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-[var(--admin-border)] flex justify-end">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] rounded-lg transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedRole(null); }}
                onConfirm={handleDeleteRole}
                title="Delete Role"
                message={`Are you sure you want to delete the role "${selectedRole?.name}"? This action cannot be undone.`}
                confirmText="Delete Role"
                confirmColor="bg-[var(--admin-danger)]"
                requireInput={true}
                inputPlaceholder="DELETE"
            />
        </div>
    );
};

export default RolesPermissionsAdmin;
