import React, { useEffect, useState } from 'react';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import adminApi from '../../services/adminApi';
import { UserCheck, UserX, Search, Shield, Sprout, ShoppingBag } from 'lucide-react';

const UsersAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/admin/users', {
                params: { page, search, limit: 10 }
            });
            setUsers(res.data.users);
            setPagination({
                currentPage: Number(res.data.currentPage),
                totalPages: Number(res.data.totalPages)
            });
        } catch (error) {
            console.error("Failed to fetch users", error);
            // Optionally set error state here
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const confirmSuspend = async () => {
        if (!selectedUser) return;

        try {
            await adminApi.put(`/admin/users/${selectedUser._id}/suspend`, {
                suspend: selectedUser.isActive
            });
            fetchUsers(); // Refresh
            setIsModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            console.error("Failed to toggle suspension", error);
        }
    };

    const columns = [
        {
            key: 'name', title: 'User', render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-[var(--admin-text-primary)]">{row.firstName} {row.lastName}</span>
                    <span className="text-xs text-[var(--admin-text-muted)]">{row.email}</span>
                </div>
            )
        },
        {
            key: 'role', title: 'Role', render: (row) => {
                const getRoleStyle = (r) => {
                    switch (r) {
                        case 'admin': return 'bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border-[var(--admin-accent)]/20';
                        case 'farmer': return 'bg-[var(--admin-success)]/10 text-[var(--admin-success)] border-[var(--admin-success)]/20';
                        default: return 'bg-[var(--admin-bg-hover)] text-[var(--admin-text-secondary)] border-[var(--admin-border)]';
                    }
                };

                const getRoleIcon = (r) => {
                    switch (r) {
                        case 'admin': return <Shield size={12} className="mr-1" />;
                        case 'farmer': return <Sprout size={12} className="mr-1" />;
                        default: return <ShoppingBag size={12} className="mr-1" />;
                    }
                };

                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center w-fit ${getRoleStyle(row.role)}`}>
                        {getRoleIcon(row.role)}
                        {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                    </span>
                );
            }
        },
        {
            key: 'createdAt',
            title: 'Joined',
            render: (row) => (
                <span className="text-[var(--admin-text-secondary)]">
                    {new Date(row.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
            )
        },
        {
            key: 'isActive', title: 'Status', render: (row) => (
                row.isActive
                    ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--admin-success)]/10 text-[var(--admin-success)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--admin-success)]"></div> Active
                    </span>
                    : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--admin-danger)]/10 text-[var(--admin-danger)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--admin-danger)]"></div> Suspended
                    </span>
            )
        },
        {
            key: 'actions', title: 'Actions', render: (row) => (
                <button
                    onClick={() => handleSuspendClick(row)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${row.isActive
                            ? 'border-[var(--admin-danger)] text-[var(--admin-danger)] hover:bg-[var(--admin-danger)] hover:text-white'
                            : 'border-[var(--admin-success)] text-[var(--admin-success)] hover:bg-[var(--admin-success)] hover:text-white'
                        }`}
                >
                    {row.isActive ? 'Suspend' : 'Activate'}
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--admin-text-primary)]">User Management</h1>
                    <p className="text-[var(--admin-text-muted)] text-sm mt-1">Manage platform users and access controls</p>
                </div>

                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full md:w-72 bg-[var(--admin-bg-secondary)] border border-[var(--admin-border)] rounded-xl pl-10 pr-4 py-2.5 text-[var(--admin-text-primary)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] focus:ring-1 focus:ring-[var(--admin-accent)] transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="admin-card overflow-hidden !p-0">
                <DataTable
                    columns={columns}
                    data={users}
                    isLoading={loading}
                    pagination={pagination}
                    onPageChange={(p) => setPage(p)}
                    className="w-full"
                />
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmSuspend}
                title={selectedUser?.isActive ? 'Suspend User' : 'Activate User'}
                message={selectedUser?.isActive
                    ? `Are you sure you want to suspend access for ${selectedUser.email}? They will not be able to log in.`
                    : `Restore access for ${selectedUser?.email}?`
                }
                confirmText={selectedUser?.isActive ? 'Suspend Account' : 'Activate Account'}
                confirmColor={selectedUser?.isActive ? 'bg-[var(--admin-danger)]' : 'bg-[var(--admin-success)]'}
                requireInput={selectedUser?.isActive}
                inputPlaceholder={selectedUser?.isActive ? 'SUSPEND' : ''}
            />
        </div>
    );
};

export default UsersAdmin;
