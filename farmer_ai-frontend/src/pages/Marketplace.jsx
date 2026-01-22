import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Tractor, Sprout, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/marketplace/ProductCard';
import CartDrawer from '../components/marketplace/CartDrawer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/authApi';

const Marketplace = () => {
    // Removed activeTab state - only showing 'inputs' category now
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toggleCart, items } = useCart();
    const navigate = useNavigate();
    const { activeRole } = useAuth();

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                console.log('Fetching marketplace products...');
                // Fetch all products
                const { data } = await api.get('/api/marketplace/products');

                console.log('API Response:', data);
                console.log('Products count:', data?.length || 0);

                if (!data || data.length === 0) {
                    console.warn('No products returned from API');
                }

                // Filter products by 'inputs' category only
                const filteredProducts = data.filter(product => {
                    return product.category === 'inputs';
                });

                console.log(`Filtered ${filteredProducts.length} products for category: inputs`);
                setProducts(filteredProducts || []);

            } catch (err) {
                console.error("Failed to fetch products", err);
                console.error("Error details:", err.response?.data || err.message);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []); // Removed activeTab dependency

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
            {/* Back Button */}
            <button
                onClick={() => navigate(activeRole === 'buyer' ? '/buyer-dashboard' : '/farmer-dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Dashboard</span>
            </button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-gray-900">Farmer Marketplace</h1>
                    <p className="text-gray-500">Buy high-quality inputs or rent farm machinery.</p>
                </div>

                {/* Cart Trigger */}
                <button
                    onClick={toggleCart}
                    className="relative p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all group"
                >
                    <ShoppingBag className="text-gray-600 group-hover:text-green-600" />
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {items.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Tabs - Removed Tools & Rentals */}
            {/* Only showing Farming Inputs now */}
            <div className="border-b border-gray-200 mb-6">
                <div className="pb-3 px-1 flex items-center gap-2 font-medium border-b-2 border-green-600 text-green-700">
                    <Sprout size={18} />
                    Farming Inputs
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search seeds, fertilizers, pesticides..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading marketplace...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No items found in this category.</p>
                        </div>
                    )}
                </div>
            )}

            <CartDrawer />
        </div>
    );
};

export default Marketplace;
