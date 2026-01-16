import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoanQueue } from '../../../api/adminFinanceApi';
import { Loader, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../../../components/dashboard/Sidebar';
import TopBar from '../../../components/dashboard/TopBar';

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
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64">
                <TopBar />
                <main className="p-8">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Loan Approval Queue</h1>
                            <p className="text-gray-500">Review and decision pending applications</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                                <span className="text-sm text-gray-500">Pending</span>
                                <p className="text-xl font-bold text-blue-600">{loans.length}</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader className="animate-spin text-green-600" size={32} />
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Loan ID</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Farmer</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Amount</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Date Applied</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loans.map(loan => (
                                        <tr key={loan._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                                #{loan._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                                        {loan.farmer?.name?.charAt(0) || 'F'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{loan.farmer?.name}</p>
                                                        <p className="text-xs text-gray-500">{loan.farmer?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                ₹{loan.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(loan.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(loan.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => navigate(`/admin/loans/${loan._id}`)}
                                                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {loans.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                                No pending loan applications found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminLoanQueue;
