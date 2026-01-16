import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import api from '../../../services/authApi';

const OrdersFulfillment = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/api/marketplace/orders');
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    // Find latest active order (not delivered/cancelled)
    const activeOrder = orders.find(o => o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'cancelled');

    // Find recent delivered orders
    const deliveredOrders = orders
        .filter(o => o.deliveryStatus === 'delivered')
        .slice(0, 3);

    const getProgress = (status) => {
        switch (status) {
            case 'pending': return 10;
            case 'shipped': return 60;
            case 'delivered': return 100;
            default: return 0;
        }
    };

    if (loading) return <div className="admin-card h-full flex items-center justify-center">Loading...</div>;

    return (
        <div className="admin-card h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Truck className="text-blue-600" size={20} />
                        Fulfillment
                    </h3>
                    <p className="text-sm text-gray-500">Track shipments & reorders</p>
                </div>
                <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <RefreshCw size={16} />
                </button>
            </div>

            {activeOrder ? (
                <div className="flex-1 flex flex-col justify-between">
                    <div className="p-5 rounded-xl bg-blue-50 border border-blue-100 mb-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded mb-2 inline-block capitalize">
                                    {activeOrder.deliveryStatus}
                                </span>
                                <h4 className="font-bold text-gray-900 border-b border-dashed border-gray-300 pb-1 mb-1 truncate max-w-[150px]" title={activeOrder._id}>#{activeOrder._id.slice(-6)}</h4>
                                <p className="text-sm text-gray-600 mt-1">{activeOrder.items[0]?.productName} {activeOrder.items.length > 1 ? `+${activeOrder.items.length - 1} more` : ''}</p>
                            </div>
                            <Package className="text-blue-300" size={32} />
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${getProgress(activeOrder.deliveryStatus)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span className="capitalize">{activeOrder.deliveryStatus}</span>
                            <span className="text-blue-700">Total: ₹{activeOrder.totalAmount}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {deliveredOrders.length > 0 ? deliveredOrders.map(order => (
                            <div key={order._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle size={14} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">Order #{order._id.slice(-6)}</p>
                                    <p className="text-xs text-gray-500">Delivered on {new Date(order.updatedAt).toLocaleDateString()}</p>
                                </div>
                                <button className="text-xs font-medium text-blue-600 hover:underline">Reorder</button>
                            </div>
                        )) : (
                            <div className="text-center text-xs text-gray-400 py-2">No recently delivered orders</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <Package className="text-gray-300 mb-3" size={48} />
                    <h4 className="font-bold text-gray-700">No Active Orders</h4>
                    <p className="text-sm text-gray-500 mb-4 max-w-[200px]">Start sourcing from our marketplace to see tracking details.</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        Browse Marketplace
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrdersFulfillment;
