import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, CreditCard, User, MapPin, Truck, ChevronRight, Download, X } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/authApi';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/api/marketplace/orders/${id}`);
                setOrder(response.data);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.response?.data?.message || 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    // Helper to resolve image URL
    const getImageUrl = (images) => {
        if (!images || !Array.isArray(images) || images.length === 0) return null;

        // Find first non-placeholder image
        const realImage = images.find(img => img && !img.includes('placehold.co'));
        if (!realImage) return null;

        if (realImage.startsWith('http') || realImage.startsWith('data:')) return realImage;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
        return `${baseUrl}${realImage}`;
    };

    const handleDownloadInvoice = async () => {
        try {
            const response = await api.get(`/api/marketplace/orders/${id}/invoice`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.orderNumber || order._id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download invoice error:', error);
            alert('Failed to download invoice. Please try again.');
        }
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        setCancelling(true);
        try {
            const response = await api.post(`/api/marketplace/orders/${id}/cancel`, {
                reason: cancelReason
            });

            console.log('Cancel response:', response.data);

            if (response.data.success) {
                alert('Order cancelled successfully');
                setShowCancelModal(false);
                setCancelReason('');
                
                // Refresh order details
                try {
                    const updatedOrder = await api.get(`/api/marketplace/orders/${id}`);
                    console.log('Updated order:', updatedOrder.data);
                    setOrder(updatedOrder.data);
                } catch (refreshError) {
                    console.error('Error refreshing order:', refreshError);
                    // Navigate back to orders list if refresh fails
                    setTimeout(() => {
                        navigate('/marketplace/orders');
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Cancel order error:', error);
            alert(error.response?.data?.message || 'Failed to cancel order. Please try again.');
        } finally {
            setCancelling(false);
        }
    };

    const canCancelOrder = () => {
        if (!order) return false;
        const cancellableStates = ['CREATED', 'PAYMENT_PENDING', 'CONFIRMED', 'PAID', 'pending'];
        return cancellableStates.includes(order.state) || cancellableStates.includes(order.deliveryStatus);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <Package size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/marketplace/orders')}
                    className="flex items-center gap-2 text-green-600 font-medium hover:underline"
                >
                    <ArrowLeft size={20} /> Back to My Orders
                </button>
            </div>
        );
    }

    if (!order) return null;

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            case 'processing': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/marketplace/orders')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
                    <p className="text-sm text-gray-500">
                        Order #{order.orderNumber || order._id.slice(-6).toUpperCase()} • {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
                    </p>
                </div>
                <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.deliveryStatus)}`}>
                    {order.deliveryStatus}
                </div>
                {canCancelOrder() && (
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancel Order
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                                <Package size={18} className="text-green-600" />
                                Order Items
                            </h2>
                            <span className="text-sm text-gray-500">{order.items.length} Items</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item, index) => {
                                // Consistent name logic
                                let productName = item.productName;
                                if (item.listing && item.listing.productRef) {
                                    if (typeof item.listing.productRef === 'object') {
                                        productName = item.listing.productRef.name;
                                    } else {
                                        productName = item.listing.productRef;
                                    }
                                } else if (item.productName && item.productName.includes('{')) {
                                    // Fallback parse
                                    try { productName = item.productName.split(' - ')[0] + ' - ' + JSON.parse(item.productName.split(' - ')[1]).name; } catch (e) { }
                                }

                                return (
                                    <div key={index} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                            {item.listing?.images?.length > 0 ? (
                                                <img src={getImageUrl(item.listing.images)} alt={productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-1">{productName}</h3>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <span>Qty: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                                                <span>Price: <span className="font-medium text-gray-900">₹{item.priceAtTime}</span></span>
                                                {item.listing?.unit && (
                                                    <span>Unit: {item.listing.unit}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right font-bold text-gray-800">
                                            ₹{item.subtotal}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timeline (Mock for now, can be real later) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Truck size={18} className="text-blue-600" />
                            Delivery Status
                        </h2>
                        <div className="relative pl-4 border-l-2 border-green-200 space-y-6">
                            <div className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-100"></div>
                                <h4 className="text-sm font-semibold text-gray-800">Order Placed</h4>
                                <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'MMM dd, h:mm a')}</p>
                            </div>
                            {/* We can add more steps based on status later */}
                            {order.deliveryStatus !== 'pending' && (
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100"></div>
                                    <h4 className="text-sm font-semibold text-gray-800 capitalize">{order.deliveryStatus}</h4>
                                    <p className="text-xs text-gray-500">Current Status</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Buyer/Shipping Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <User size={18} className="text-purple-600" />
                            Customer Details
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Name</p>
                                <p className="font-medium">{order.buyer?.firstName} {order.buyer?.lastName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email</p>
                                <p className="font-medium">{order.buyer?.email}</p>
                            </div>
                            {/* Address - Assuming it's in shippingAddress object or fallback to user profile if not stored on order directly (schema check needed, but let's assume standard) */}
                            {order.shippingAddress && (
                                <div>
                                    <p className="text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12} /> Shipping Address</p>
                                    <p className="font-medium text-gray-800 bg-gray-50 p-2 rounded">
                                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard size={18} className="text-orange-600" />
                            Payment Summary
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">₹{order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shipping</span>
                                <span className="font-medium text-green-600">Free</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-bold text-gray-800">
                                <span>Total</span>
                                <span>₹{order.totalAmount}</span>
                            </div>
                            <div className={`mt-4 w-full py-2 rounded-lg text-center text-xs font-bold uppercase tracking-wide ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                Status: {order.paymentStatus}
                            </div>
                            {order.paymentStatus === 'paid' && (
                                <button
                                    onClick={handleDownloadInvoice}
                                    className="mt-3 w-full py-2 bg-primary-green text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Download Invoice
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Cancel Order</h2>
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600">
                            Are you sure you want to cancel this order? Stock will be restored and any payments will be refunded.
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Reason for cancellation</label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please tell us why you're cancelling this order..."
                                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                rows="4"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancelReason('');
                                }}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling || !cancelReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;
