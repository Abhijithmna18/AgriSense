import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Calendar, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import api from '../../services/authApi'; // Import the configured axios instance
import { useAuth } from '../../context/AuthContext';

const CartDrawer = () => {
    const { isOpen, toggleCart, items, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    // Format Price
    const formatPrice = (price) => `Rs. ${price.toLocaleString()} `;

    const handleViewCart = () => {
        toggleCart();
        navigate('/marketplace/cart');
    };

    const handleCheckout = () => {
        toggleCart();
        navigate('/marketplace/checkout');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={toggleCart}></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold font-serif text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="text-green-600" />
                        Your Cart
                    </h2>
                    <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                            <ShoppingBag size={48} className="opacity-20" />
                            <p>Your cart is empty</p>
                            <button onClick={() => { toggleCart(); navigate('/marketplace'); }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                                Browse Items
                            </button>
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={`${item._id}-${idx}`} className="flex gap-4 p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    {item.images && item.images[0] && <img src={item.images[0]} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-800 line-clamp-1">{item.name || (typeof item.productRef === 'string' ? item.productRef : item.productRef?.name)}</h3>
                                        <button
                                            onClick={() => removeFromCart(item._id, item.buyType)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {item.buyType === 'rent' ? (
                                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mb-2 flex items-center gap-1">
                                            <Calendar size={12} />
                                            Rental: {item.rentalDays} Days
                                        </div>
                                    ) : (
                                        <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded w-fit mb-2">
                                            Buy: Inputs
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.buyType, Math.max(1, item.quantity - 1))}
                                                className="text-gray-500 hover:text-gray-800 font-bold"
                                            >-</button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.buyType, item.quantity + 1)}
                                                className="text-gray-500 hover:text-gray-800 font-bold"
                                            >+</button>
                                        </div>
                                        <p className="font-bold text-gray-800">
                                            {formatPrice(
                                                (item.buyType === 'buy' ? item.pricePerUnit : (item.rentPrice?.daily || 0 * item.rentalDays)) * item.quantity
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-3">
                        <div className="flex justify-between text-lg font-bold text-gray-900 pb-2">
                            <span>Total</span>
                            <span>{formatPrice(cartTotal * 1.05)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleViewCart}
                                className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                View Cart
                            </button>
                            <button
                                onClick={handleCheckout}
                                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;


