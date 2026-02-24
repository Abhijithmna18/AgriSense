import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, CheckCircle, Clock, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/authApi';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import ShipmentIntelligencePanel from '../components/dashboard/buyer/ShipmentIntelligencePanel';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/marketplace/orders/${id}`);
            setOrder(response.data);

            // Check if user has already reviewed this order - only if order exists
            if (response.data) {
                checkIfReviewed();
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
            // Don't show toast error - just let the error UI display
        } finally {
            setLoading(false);
        }
    };

    const checkIfReviewed = async () => {
        try {
            const { data } = await api.get('/api/reviews/my-reviews?limit=100');
            if (data.reviews && Array.isArray(data.reviews)) {
                const reviewed = data.reviews.some(r => r.order && r.order._id === id);
                setHasReviewed(reviewed);
            }
        } catch (error) {
            console.error('Failed to check reviews:', error);
            // Don't fail the page if review check fails
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            shipped: 'bg-blue-100 text-blue-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock size={16} />;
            case 'shipped':
                return <Truck size={16} />;
            case 'delivered':
                return <CheckCircle size={16} />;
            default:
                return <Package size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-8">
                <div className="text-center text-gray-500">Loading order details...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto p-8 space-y-4">
                <button
                    onClick={() => navigate('/marketplace/orders')}
                    className="flex items-center text-gray-500 hover:text-gray-800 mb-4"
                >
                    <ArrowLeft size={18} className="mr-2" /> Back to Orders
                </button>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <Package size={48} className="mx-auto text-red-300 mb-4" />
                    <h2 className="text-xl font-bold text-red-900 mb-2">Order Not Found</h2>
                    <p className="text-red-700 mb-4">This order may have been deleted or you don't have permission to view it.</p>
                    <button
                        onClick={() => navigate('/marketplace/orders')}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                    >
                        Go Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-8">
            {/* Header */}
            <button
                onClick={() => navigate('/marketplace/orders')}
                className="flex items-center text-gray-500 hover:text-gray-800 mb-4"
            >
                <ArrowLeft size={18} className="mr-2" /> Back to Orders
            </button>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-gray-500 mt-1">Order #{order.orderNumber}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${getStatusColor(order.deliveryStatus)}`}>
                        {getStatusIcon(order.deliveryStatus)}
                        {order.deliveryStatus.charAt(0).toUpperCase() + order.deliveryStatus.slice(1)}
                    </span>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Seller Info */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">Seller Information</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p className="text-sm">
                                <span className="text-gray-600">Name:</span>
                                <span className="font-medium ml-2">{order.seller.firstName} {order.seller.lastName}</span>
                            </p>
                            {order.seller.vendorProfile?.businessName && (
                                <p className="text-sm">
                                    <span className="text-gray-600">Business:</span>
                                    <span className="font-medium ml-2">{order.seller.vendorProfile.businessName}</span>
                                </p>
                            )}
                            <p className="text-sm">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium ml-2">{order.seller.email}</span>
                            </p>
                            {order.seller.phone && (
                                <p className="text-sm">
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium ml-2">{order.seller.phone}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p className="text-sm font-medium text-gray-900">{order.deliveryAddress?.label || 'Farm'}</p>
                            <p className="text-sm text-gray-600">{order.deliveryAddress?.addressLine || 'Shipping Address'}</p>
                            <p className="text-sm text-gray-600">
                                {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.postalCode}
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Logistics Intelligence integration */}
                {order.items && order.items.length > 0 && (
                    <div className="mb-8 animate-fade-in">
                        <ShipmentIntelligencePanel
                            vendorId={order.seller._id || order.seller}
                            listingId={order.items[0].listing?._id || order.items[0].listing || 'mock_listing_id'}
                            cropName={order.items[0].productName}
                            sourceLat={order.seller.location?.lat || 20.0} // Mock defaults if geo missing
                            sourceLon={order.seller.location?.lng || 73.0}
                            destLat={order.deliveryAddress?.location?.lat || 18.5}
                            destLon={order.deliveryAddress?.location?.lng || 73.8}
                        />
                    </div>
                )}

                {/* Order Items */}
                <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-gray-900">Order Items</h3>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{item.productName}</p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">₹{item.priceAtTime} per unit</p>
                                    <p className="text-sm text-gray-500">Subtotal: ₹{item.subtotal}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Tax (5%)</span>
                        <span className="font-medium">₹{(order.totalAmount * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Amount</span>
                        <span>₹{(order.totalAmount * 1.05).toFixed(2)}</span>
                    </div>
                </div>

                {/* Order Timeline */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Order Timeline</h3>
                    <div className="space-y-3">
                        {order.statusHistory && order.statusHistory.map((history, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                    {idx < order.statusHistory.length - 1 && (
                                        <div className="w-0.5 h-12 bg-gray-200 my-2"></div>
                                    )}
                                </div>
                                <div className="pb-4">
                                    <p className="font-medium text-gray-900">{history.status}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(history.timestamp).toLocaleString()}
                                    </p>
                                    {history.comment && (
                                        <p className="text-sm text-gray-600 mt-1">{history.comment}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Review Section */}
            {order.deliveryStatus === 'delivered' && (
                <div className="space-y-6">
                    {!hasReviewed && !showReviewForm && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-blue-900">Share Your Experience</h3>
                                <p className="text-sm text-blue-700 mt-1">Help other farmers by reviewing this order</p>
                            </div>
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                Write Review
                            </button>
                        </div>
                    )}

                    {showReviewForm && (
                        <ReviewForm
                            orderId={id}
                            productId={order.items[0]?.listing?._id || order.items[0]?.listing}
                            onReviewSubmitted={() => {
                                setShowReviewForm(false);
                                setHasReviewed(true);
                            }}
                            onCancel={() => setShowReviewForm(false)}
                        />
                    )}

                    {/* Reviews List */}
                    {order.items[0]?.listing && (
                        <ReviewsList
                            productId={order.items[0]?.listing?._id || order.items[0]?.listing}
                            onReviewDeleted={() => setHasReviewed(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;
