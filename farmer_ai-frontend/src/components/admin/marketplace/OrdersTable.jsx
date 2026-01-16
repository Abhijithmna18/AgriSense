import React, { useState, useEffect } from 'react';
import { getMarketplaceOrders, updateOrderStatus } from '../../../services/adminApi';
import {
    Edit, Eye, CheckCircle, Clock, Truck, User, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrdersTable = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    const [selectedOrder, setSelectedOrder] = useState(null); // For Modal

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getMarketplaceOrders({
                page,
                limit: 10,
                status: statusFilter
            });
            setOrders(res.data.orders);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            await updateOrderStatus(selectedOrder._id, {
                deliveryStatus: formData.get('deliveryStatus'),
                paymentStatus: formData.get('paymentStatus'),
                comment: formData.get('comment')
            });
            setSelectedOrder(null);
            fetchOrders();
            // Show toast success (simulated)
            alert('Order updated successfully');
        } catch (error) {
            alert('Update failed');
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
                    <option value="">All Delivery Status</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[var(--admin-border)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-[var(--admin-border)]">
                            <tr>
                                <th className="p-4 font-medium text-gray-500">Order ID</th>
                                <th className="p-4 font-medium text-gray-500">Buyer</th>
                                <th className="p-4 font-medium text-gray-500">Items</th>
                                <th className="p-4 font-medium text-gray-500">Total</th>
                                <th className="p-4 font-medium text-gray-500">Delivery</th>
                                <th className="p-4 font-medium text-gray-500">Payment</th>
                                <th className="p-4 font-medium text-gray-500">Date</th>
                                <th className="p-4 font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-400">Loading...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-400">No orders found</td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="border-b border-[var(--admin-border)] hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-xs text-gray-500">{order.orderId.split('-')[0]}...</td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{order.buyer?.firstName} {order.buyer?.lastName}</span>
                                                <span className="text-xs text-gray-400">{order.buyer?.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {order.items.length} items
                                        </td>
                                        <td className="p-4 font-medium">₹{order.totalAmount}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                                                ${order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.deliveryStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                        order.deliveryStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'}`
                                            }>
                                                {order.deliveryStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                                                ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                                    order.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-gray-100 text-gray-700'}`
                                            }>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-3 py-1.5 bg-white border border-[var(--admin-border)] hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination - Reuse logic */}
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

            {/* Manage Order Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold font-serif">Manage Order #{selectedOrder.orderId.split('-')[0]}</h3>
                                <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleUpdateStatus} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
                                    <select name="deliveryStatus" defaultValue={selectedOrder.deliveryStatus} className="w-full p-2 border rounded-xl">
                                        <option value="pending">Pending</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                                    <select name="paymentStatus" defaultValue={selectedOrder.paymentStatus} className="w-full p-2 border rounded-xl">
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Audit Comment (Required)</label>
                                    <textarea name="comment" required placeholder="Reason for change..." className="w-full p-2 border rounded-xl h-24"></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent-hover)]">Update Order</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrdersTable;
