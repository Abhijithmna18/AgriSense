import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoanQueue } from '../../../api/adminFinanceApi';
import { Loader } from 'lucide-react';

const AdminLoanQueue = () => {
    const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQueue();
    }, []);

    const loadQueue = async () => {
        try {
            const data = await getLoanQueue();
            setLoans(data);
        } catch (error) {
            console.error("Failed to load queue", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            applied: 'bg-blue-100 text-blue-800',
            review_pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--admin-text-primary)]">Loan Approval Queue</h1>
                    <p className="text-[var(--admin-text-secondary)]">Review and decision pending applications</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-[var(--admin-bg-secondary)] px-4 py-2 rounded-lg shadow-sm border border-[var(--admin-border)]">
                        <span className="text-sm text-[var(--admin-text-secondary)]">Pending</span>
                        <p className="text-xl font-bold text-[var(--admin-accent)]">{loans.length}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader className="animate-spin text-[var(--admin-accent)]" size={32} />
                </div>
            ) : (
                <div className="bg-[var(--admin-bg-secondary)] rounded-xl shadow-sm border border-[var(--admin-border)] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--admin-bg-hover)] border-b border-[var(--admin-border)]">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-[var(--admin-text-primary)]">Loan ID</th>
                                <th className="px-6 py-4 font-semibold text-[var(--admin-text-primary)]">Farmer</th>
                                <th className="px-6 py-4 font-semibold text-[var(--admin-text-primary)]">Amount</th>
                                <th className="px-6 py-4 font-semibold text-[var(--admin-text-primary)]">Date Applied</th>
                                <th className="px-6 py-4 font-semibold text-[var(--admin-text-primary)]">Status</th>
                                <th className="px-6 py-4 font-semibold text-[var(--admin-text-primary)]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--admin-border)]">
                            {loans.map(loan => (
                                <tr key={loan._id} className="hover:bg-[var(--admin-bg-hover)] transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-[var(--admin-text-secondary)]">
                                        #{loan._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                                {loan.farmer?.name?.charAt(0) || 'F'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--admin-text-primary)]">{loan.farmer?.name}</p>
                                                <p className="text-xs text-[var(--admin-text-secondary)]">{loan.farmer?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[var(--admin-text-primary)]">
                                        ₹{loan.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--admin-text-secondary)]">
                                        {new Date(loan.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(loan.status)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => navigate(`/admin/loans/${loan._id}`)}
                                            className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {loans.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-[var(--admin-text-muted)]">
                                        No pending loan applications found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminLoanQueue;
