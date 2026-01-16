import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/authApi';

const VendorPayments = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/marketplace/vendor/payments');
            setTransactions(data.data || []);
        } catch (error) {
            console.error('Failed to fetch payments', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                    <p className="text-gray-500">Track your earnings and payouts</p>
                </div>
                <div className="bg-white px-6 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-medium">Total Earned:</span>
                    <span className="text-xl font-bold text-gray-900">
                        ₹{transactions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading payments...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                        <p className="text-gray-500">Your completed sales will appear here</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Transaction ID</th>
                                    <th className="px-6 py-4 font-medium">Order Ref</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Method</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map(txn => (
                                    <tr key={txn.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900 font-mono text-xs">
                                            {txn.id}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {typeof txn.orderId === 'string' ? txn.orderId : `ORD-${txn.orderId}`}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-700">
                                            +₹{txn.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm capitalize">
                                            {txn.method}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {new Date(txn.date).toLocaleDateString()} <span className="text-gray-300">|</span> {new Date(txn.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 w-fit">
                                                <CheckCircle size={12} />
                                                Credited
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorPayments;
