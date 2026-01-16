import React, { useState } from 'react';
import { ShoppingCart, Calendar, Info, Truck, CheckCircle, Store, Sprout, MapPin } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [rentalDays, setRentalDays] = useState(1);
    const [showRentalConfig, setShowRentalConfig] = useState(false);

    // Helper to format currency
    const formatPrice = (price) => `₹${price.toLocaleString()}`;

    // Extract product name from productRef (which can be an object)
    const getProductName = () => {
        if (typeof product.productRef === 'object' && product.productRef !== null) {
            return product.productRef.name || product.productRef.breed || 'Product';
        }
        return product.productRef || product.name || 'Product';
    };

    // Extract company/brand from productRef
    const getCompany = () => {
        if (typeof product.productRef === 'object' && product.productRef !== null) {
            return product.productRef.brand || product.productRef.variety || '';
        }
        return product.company || '';
    };

    // Get category display name from productType
    const getCategoryDisplay = () => {
        const typeMap = {
            'crop': 'Seeds',
            'input': 'Inputs',
            'livestock': 'Livestock'
        };
        return product.category || typeMap[product.productType] || product.productType || 'Product';
    };

    // Get description
    const getDescription = () => {
        if (product.description) return product.description;
        if (typeof product.productRef === 'object' && product.productRef !== null) {
            const parts = [];
            if (product.productRef.variety) parts.push(product.productRef.variety);
            if (product.productRef.weight) parts.push(product.productRef.weight);
            if (product.productRef.age) parts.push(`Age: ${product.productRef.age}`);
            return parts.join(' • ');
        }
        return '';
    };

    const handleAddToCart = () => {
        // Normalize product data for cart
        const normalizedProduct = {
            ...product,
            name: getProductName(),
            company: getCompany(),
            category: getCategoryDisplay(),
            price: product.pricePerUnit || product.price,
            // For compatibility with cart
            type: product.type || 'buy',
            buyType: product.type || 'buy'
        };

        if (product.type === 'rent') {
            if (rentalDays < 1) return;
            addToCart(normalizedProduct, 'rent', { rentalDays });
            setShowRentalConfig(false);
        } else {
            addToCart(normalizedProduct, 'buy');
        }
    };

    const productName = getProductName();
    const company = getCompany();
    const category = getCategoryDisplay();
    const description = getDescription();
    const price = product.pricePerUnit || product.price || 0;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
            {/* Image Area */}
            <div className="h-48 bg-gray-100 relative group">
                {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={productName} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                    <img
                        src={(() => {
                            const type = product.productType || 'input';
                            if (type === 'crop') return 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600'; // Wheat/Crops
                            if (type === 'livestock') return 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=600'; // Cow/Livestock
                            if (type === 'rent') return 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?auto=format&fit=crop&q=80&w=600'; // Tractor
                            return 'https://images.unsplash.com/photo-1627920769842-894768393af8?auto=format&fit=crop&q=80&w=600'; // Fertilizer/Input
                        })()}
                        alt={category}
                        className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105"
                    />
                )}

                {/* Overlay Gradient for text readability if needed, but keeping it clean for now */}

                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-700 uppercase tracking-wide shadow-sm">
                    {category}
                </span>
                {product.type === 'rent' && (
                    <span className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                        Rental Only
                    </span>
                )}
                {product.location && (
                    <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <MapPin size={10} /> {product.location}
                    </span>
                )}
            </div>

            {/* Content Area */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{productName}</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            {product.seller?.roles?.includes('vendor') ? (
                                <span className="flex items-center gap-1 text-blue-600 font-medium">
                                    <Store size={12} />
                                    {product.seller.vendorProfile?.businessName || 'Verified Vendor'}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-green-600">
                                    <Sprout size={12} />
                                    {product.seller?.firstName ? `${product.seller.firstName} (Farmer)` : 'Local Farmer'}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex-1">
                    {description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{description}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 w-fit px-2 py-1 rounded mb-3">
                        <CheckCircle size={12} />
                        <span>In Stock: {product.quantity} {product.unit}</span>
                    </div>
                </div>

                {/* Price Section */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <p className="text-xs text-gray-400">Price per {product.unit || 'unit'}</p>
                            <p className="text-xl font-bold text-gray-800">
                                {product.type === 'rent'
                                    ? <>{formatPrice(product.rentPrice?.daily || price)}<span className="text-sm text-gray-500 font-normal">/day</span></>
                                    : formatPrice(price)
                                }
                            </p>
                        </div>
                        {product.type === 'rent' && product.deposit > 0 && (
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Deposit</p>
                                <p className="text-sm font-semibold text-gray-600">{formatPrice(product.deposit)}</p>
                            </div>
                        )}
                    </div>

                    {/* Rental Configuration (Conditional) */}
                    {product.type === 'rent' && showRentalConfig && (
                        <div className="mb-3 bg-gray-50 p-3 rounded-lg animate-fade-in">
                            <label className="text-xs font-medium text-gray-600 block mb-1">Duration (Days)</label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setRentalDays(Math.max(1, rentalDays - 1))} className="w-8 h-8 rounded border bg-white">-</button>
                                <span className="flex-1 text-center font-bold">{rentalDays}</span>
                                <button onClick={() => setRentalDays(rentalDays + 1)} className="w-8 h-8 rounded border bg-white">+</button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {product.type === 'rent' ? (
                        showRentalConfig ? (
                            <button
                                onClick={handleAddToCart}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Confirm Rental
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowRentalConfig(true)}
                                className="w-full py-2.5 bg-white border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Calendar size={16} /> Rent Now
                            </button>
                        )
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={16} /> Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
