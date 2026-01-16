import React from 'react';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
    const navigate = useNavigate();

    const handleQuantityChange = (itemId, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty > 0) {
            updateQuantity(itemId, newQty);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Trash2 className="text-gray-400" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
                <p className="text-gray-500">Looks like you haven't added anything yet.</p>
                <button
                    onClick={() => navigate('/marketplace')}
                    className="mt-6 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="flex-1 space-y-4">
                    {items.map((item) => (
                        <div key={item._id} className="bg-white p-4 rounded-xl border border-gray-200 flex sm:flex-row flex-col gap-4">
                            <img
                                src={item.images?.[0] || 'https://via.placeholder.com/150'}
                                alt={item.productRef?.name || 'Product'}
                                className="w-full sm:w-24 sm:h-24 object-cover rounded-lg bg-gray-100"
                            />

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {typeof item.productRef === 'object' ? item.productRef.name : item.productRef}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize">{item.productType}</p>
                                        <p className="text-sm text-green-600 font-medium mt-1">
                                            ₹{item.pricePerUnit} / {item.unit}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item._id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                        <button
                                            onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                                            className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="font-medium text-sm w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                                            className="p-1 hover:bg-white rounded-md transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <p className="font-bold text-gray-900">
                                        ₹{(item.pricePerUnit * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:w-80">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-24 space-y-4">
                        <h3 className="font-semibold text-lg text-gray-900">Order Summary</h3>

                        <div className="space-y-2 py-4 border-y border-gray-100">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Taxes (5%)</span>
                                <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-lg text-gray-900">
                            <span>Total</span>
                            <span>₹{(cartTotal * 1.05).toFixed(2)}</span>
                        </div>

                        <button
                            onClick={() => console.log('Proceed to checkout')}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                        >
                            Proceed to Checkout
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
