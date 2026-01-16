import React, { useState, useEffect } from 'react';
import { getMarketplacePayments, verifyPayment } from '../../../services/adminApi';
import { ShieldCheck, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PaymentsLedger = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await getMarketplacePayments({
                page,
                limit: 10,
                status: statusFilter
            });
            setPayments(res.data.payments);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Failed to fetch payments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page, statusFilter]);

    const handleVerifyFilter = async (id, status, reason = '') => {
        if (!window.confirm(`Are you sure you want to mark this payment as ${status}?`)) return;

        try {
            await verifyPayment(id, { status, reason });
            fetchPayments();
        } catch (error) {
            alert('Action failed');
        }
    };

    return (
        <div>
            {/* Filter */}
            <div className="mb-4 flex justify-end">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-[var(--admin-border)] rounded-xl px-4 py-2 outline-none"
                >
                    <option value="">All Scrutiny Status</option>
                    <option value="pending_verification">Pending Verification</option>
                    <option value="verified">Verified</option>
                    <option value="flagged">Flagged</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--admin-border)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-[var(--admin-border)]">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">Transaction ID</th>
                                <th className="p-4 font-medium text-gray-500">Order Ref</th>
                                <th className="p-4 font-medium text-gray-500">Amount</th>
                                <th className="p-4 font-medium text-gray-500">Method</th>
                                <th className="p-4 font-medium text-gray-500">Status</th>
                                <th className="p-4 font-medium text-gray-500">Date</th>
                                <th className="p-4 font-medium text-gray-500">Scrutiny</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading...</td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No payment records found</td></tr>
                            ) : (
                                payments.map((pay) => (
                                    <tr key={pay.paymentId} className="border-b border-[var(--admin-border)] hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-gray-500">{pay.paymentId}</td>
                                        <td className="p-4 text-xs">
                                            {pay.order ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[var(--admin-accent)]">#{pay.order.orderId?.split('-')[0]}</span>
                                                    <span className="text-gray-400">{pay.order.buyer?.firstName} {pay.order.buyer?.lastName}</span>
                                                </div>
                                            ) : <span className="text-red-400">Orphaned</span>}
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">₹{pay.amount}</td>
                                        <td className="p-4 capitalize text-sm text-gray-600">{pay.method}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                                                ${pay.status === 'verified' ? 'bg-green-100 text-green-700' :
                                                    pay.status === 'flagged' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'}`
                                            }>
                                                {pay.status === 'pending_verification' ? 'Pending' : pay.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(pay.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            {pay.status === 'pending_verification' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVerifyFilter(pay._id, 'verified')}
                                                        className="p-1 hover:bg-green-50 rounded text-green-600"
                                                        title="Verify"
                                                    >
                                                        <ShieldCheck size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt("Enter flagging reason:");
                                                            if (reason) handleVerifyFilter(pay._id, 'flagged', reason);
                                                        }}
                                                        className="p-1 hover:bg-red-50 rounded text-red-600"
                                                        title="Flag"
                                                    >
                                                        <AlertTriangle size={18} />
                                                    </button>
                                                </div>
                                            )}
                                            {pay.status === 'verified' && <div className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Verified</div>}
                                            {pay.status === 'flagged' && <div className="text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> Flagged</div>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 flex items-center justify-between bg-gray-50 border-t border-[var(--admin-border)]">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="flex items-center gap-1 text-sm font-medium text-gray-600 disabled:opacity-50 hover:text-gray-900"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="flex items-center gap-1 text-sm font-medium text-gray-600 disabled:opacity-50 hover:text-gray-900"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentsLedger;
