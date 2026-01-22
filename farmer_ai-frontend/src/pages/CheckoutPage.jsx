import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/authApi";
import { negotiationAPI } from "../services/negotiationApi";
import { MapPin, Plus, CheckCircle, ArrowLeft, Lock, MessageSquare, Package, AlertCircle } from "lucide-react";
import toast from 'react-hot-toast';

const CheckoutPage = () => {
    const { items, cartTotal, clearCart, removeItems } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [negotiationItems, setNegotiationItems] = useState(new Set());
    const [isNegotiating, setIsNegotiating] = useState(false);

    // New Address Form State
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        addressLine: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const { data } = await api.get('/api/users/address');
            if (data.success) {
                setAddresses(data.addresses);
                // Select default if exists
                if (data.addresses.length > 0 && !selectedAddressId) {
                    const defaultAddr = data.addresses.find(a => a.label?.toLowerCase() === 'home') || data.addresses[0];
                    setSelectedAddressId(defaultAddr._id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch addresses");
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/api/users/address', newAddress);
            if (data.success) {
                setAddresses(data.addresses);
                const newlyAdded = data.addresses[data.addresses.length - 1];
                setSelectedAddressId(newlyAdded._id);
                setIsAddingAddress(false);
                toast.success('Address added successfully');
                // Reset form
                setNewAddress({ label: 'Home', addressLine: '', city: '', state: '', postalCode: '', country: 'India' });
            }
        } catch (error) {
            toast.error('Failed to add address');
        }
    };

    const handlePayment = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }

        // Check if any items are marked for negotiation
        if (negotiationItems.size > 0) {
            await handleNegotiationFlow();
            return;
        }

        setLoading(true);
        try {
            // 1. Prepare Payload
            const selectedAddress = addresses.find(a => a._id === selectedAddressId);

            const itemData = items.map(item => ({
                itemId: item._id,
                type: item.buyType,
                quantity: item.quantity,
                rentalDuration: item.rentalDays || 0,
                startDate: new Date(),
                endDate: new Date(Date.now() + (item.rentalDays || 0) * 86400000)
            }));

            // 2. Create Order
            const { data } = await api.post('/api/marketplace/order', {
                items: itemData,
                deliveryAddress: selectedAddress
            });

            // 3. Razorpay Options
            const options = {
                key: data.key,
                amount: data.amount * 100,
                currency: "INR",
                name: "AgriSense",
                description: "Marketplace Order",
                order_id: data.razorpayOrderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/api/marketplace/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data.success) {
                            toast.success('Order Placed Successfully!');
                            clearCart();
                            navigate('/marketplace/orders'); // Redirect to orders
                        }
                    } catch (error) {
                        toast.error('Payment Verification Failed');
                    }
                },
                prefill: {
                    name: user?.firstName,
                    email: user?.email,
                    contact: user?.phone
                },
                theme: { color: "#16a34a" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Checkout failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleNegotiationFlow = async () => {
        setIsNegotiating(true);
        try {
            const negotiationPromises = [];
            
            // Create negotiations for selected items
            for (const itemId of negotiationItems) {
                const item = items.find(i => i._id === itemId);
                if (item) {
                    const initialTerms = {
                        price: item.pricePerUnit * 0.9, // Start with 10% discount request
                        quantity: item.quantity,
                        deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        qualityRequirements: 'Standard',
                        message: `Bulk order negotiation for ${item.quantity} units of ${item.name}. Looking for better pricing on this large quantity order.`
                    };

                    negotiationPromises.push(
                        negotiationAPI.createNegotiation(
                            item._id,
                            item.seller._id || item.seller, // Handle both object and string cases
                            initialTerms
                        )
                    );
                }
            }

            const results = await Promise.allSettled(negotiationPromises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            if (successful > 0) {
                toast.success(`${successful} negotiation${successful > 1 ? 's' : ''} started successfully!`);
                
                // Remove negotiated items from cart
                const negotiatedItemIds = Array.from(negotiationItems);
                removeItems(negotiatedItemIds);
                
                // Navigate to negotiations page
                navigate('/negotiations');
            }

            if (failed > 0) {
                toast.error(`${failed} negotiation${failed > 1 ? 's' : ''} failed to start`);
            }

        } catch (error) {
            console.error('Negotiation flow error:', error);
            toast.error('Failed to start negotiations');
        } finally {
            setIsNegotiating(false);
        }
    };

    const toggleNegotiation = (itemId) => {
        const newNegotiationItems = new Set(negotiationItems);
        if (newNegotiationItems.has(itemId)) {
            newNegotiationItems.delete(itemId);
        } else {
            newNegotiationItems.add(itemId);
        }
        setNegotiationItems(newNegotiationItems);
    };

    const getBulkItems = () => {
        return items.filter(item => item.quantity >= 10);
    };

    const getRegularItems = () => {
        return items.filter(item => !negotiationItems.has(item._id));
    };

    const getNegotiationTotal = () => {
        return items
            .filter(item => negotiationItems.has(item._id))
            .reduce((total, item) => total + (item.pricePerUnit * item.quantity), 0);
    };

    const getRegularTotal = () => {
        return items
            .filter(item => !negotiationItems.has(item._id))
            .reduce((total, item) => total + (item.pricePerUnit * item.quantity), 0);
    };

    if (items.length === 0) {
        return <div className="p-8 text-center">Your cart is empty. <button onClick={() => navigate('/marketplace')} className="text-green-600 underline">Go shopping</button></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={() => navigate('/marketplace/cart')} className="flex items-center text-gray-500 hover:text-gray-800">
                <ArrowLeft size={18} className="mr-2" /> Back to Cart
            </button>

            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Address Selection */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="text-green-600" /> Delivery Address
                    </h2>

                    <div className="space-y-3">
                        {addresses.map(addr => (
                            <div
                                key={addr._id}
                                onClick={() => setSelectedAddressId(addr._id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 capitalize">{addr.label}</span>
                                            {selectedAddressId === addr._id && <CheckCircle size={16} className="text-green-600" />}
                                        </div>
                                        <p className="text-sm text-gray-600">{addr.addressLine}</p>
                                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setIsAddingAddress(!isAddingAddress)}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Add New Address
                        </button>

                        {isAddingAddress && (
                            <form onSubmit={handleAddAddress} className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-200 animate-fade-in">
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="Label (e.g. Farm)" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })} className="p-2 border rounded" required />
                                    <input placeholder="Postal Code" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="p-2 border rounded" required />
                                </div>
                                <input placeholder="Address Line" value={newAddress.addressLine} onChange={e => setNewAddress({ ...newAddress, addressLine: e.target.value })} className="w-full p-2 border rounded" required />
                                <div className="grid grid-cols-2 gap-3">
                                    <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="p-2 border rounded" required />
                                    <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className="p-2 border rounded" required />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Save Address</button>
                                    <button type="button" onClick={() => setIsAddingAddress(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded-lg">Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit sticky top-6">
                    <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                    
                    {/* Bulk Order Negotiation Section */}
                    {getBulkItems().length > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Package className="text-blue-600" size={18} />
                                <h4 className="font-medium text-blue-900">Bulk Order Options</h4>
                            </div>
                            <p className="text-sm text-blue-700 mb-3">
                                Items with 10+ quantity qualify for price negotiations
                            </p>
                            
                            <div className="space-y-2">
                                {getBulkItems().map(item => (
                                    <div key={item._id} className="flex items-center justify-between p-2 bg-white rounded border">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id={`negotiate-${item._id}`}
                                                checked={negotiationItems.has(item._id)}
                                                onChange={() => toggleNegotiation(item._id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor={`negotiate-${item._id}`} className="text-sm cursor-pointer">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-gray-500 ml-1">({item.quantity} units)</span>
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MessageSquare size={14} className="text-blue-500" />
                                            <span className="text-xs text-blue-600">Negotiate</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {negotiationItems.size > 0 && (
                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={14} className="text-yellow-600" />
                                        <span className="text-xs text-yellow-700">
                                            {negotiationItems.size} item{negotiationItems.size > 1 ? 's' : ''} selected for negotiation
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                        {items.map(item => (
                            <div key={item._id} className={`flex justify-between text-sm p-2 rounded ${
                                negotiationItems.has(item._id) ? 'bg-blue-50 border border-blue-200' : ''
                            }`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 truncate max-w-[120px]">
                                        {item.quantity}x {item.name || item.productRef?.name}
                                    </span>
                                    {negotiationItems.has(item._id) && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            Negotiating
                                        </span>
                                    )}
                                </div>
                                <span className={`font-medium ${
                                    negotiationItems.has(item._id) ? 'text-blue-700' : 'text-gray-900'
                                }`}>
                                    ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-3 space-y-2">
                        {negotiationItems.size > 0 && (
                            <>
                                <div className="flex justify-between text-sm text-blue-600">
                                    <span>Items for Negotiation</span>
                                    <span>₹{getNegotiationTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Pay Now (Regular Items)</span>
                                    <span>₹{getRegularTotal().toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        
                        {negotiationItems.size === 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div className="flex justify-between font-bold text-lg text-gray-900">
                            <span>Total Payable</span>
                            <span>₹{(negotiationItems.size > 0 ? getRegularTotal() * 1.05 : cartTotal * 1.05).toFixed(2)}</span>
                        </div>
                        
                        {negotiationItems.size > 0 && (
                            <div className="text-xs text-gray-500 mt-2">
                                * Negotiated items will be processed separately
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-3">
                        {negotiationItems.size > 0 ? (
                            <>
                                <button
                                    onClick={handleNegotiationFlow}
                                    disabled={isNegotiating}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isNegotiating ? 'Starting Negotiations...' : (
                                        <>
                                            <MessageSquare size={18} /> Start Negotiations
                                        </>
                                    )}
                                </button>
                                
                                {getRegularTotal() > 0 && (
                                    <button
                                        onClick={handlePayment}
                                        disabled={loading}
                                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : (
                                            <>
                                                <Lock size={18} /> Pay for Regular Items
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        <Lock size={18} /> Pay Securely
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
