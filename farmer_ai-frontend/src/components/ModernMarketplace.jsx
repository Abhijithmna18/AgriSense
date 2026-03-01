import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingCart, 
    Eye, 
    ArrowRight, 
    Star, 
    TrendingUp, 
    Package, 
    Shield,
    Zap,
    Heart,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModernMarketplace = ({ config }) => {
    const navigate = useNavigate();
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [likedProducts, setLikedProducts] = useState(new Set());

    // Default fallback data
    const defaultConfig = {
        title: 'Premium Marketplace',
        subtitle: 'Discover quality agricultural products from verified vendors',
        viewAllLink: '/marketplace',
        carousel: {
            autoPlay: false,
            slideDuration: 3,
            navigationStyle: 'dots',
            itemsPerView: { desktop: 4, tablet: 2, mobile: 1 }
        },
        featuredProducts: [
            {
                productId: '1',
                productName: 'Premium Saffron Bulbs',
                productPrice: 12500,
                originalPrice: 15000,
                carouselImage: 'https://images.unsplash.com/photo-1599909533730-c1b6e3c1e9d8?w=600&q=80',
                badge: 'new',
                rating: 4.8,
                reviews: 124,
                vendor: 'AgriPro Seeds',
                quickAction: 'viewDetails',
                showOnHome: true,
                inStock: true
            },
            {
                productId: '2',
                productName: 'Organic Wheat Seeds',
                productPrice: 2800,
                originalPrice: 3200,
                carouselImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
                badge: 'bestseller',
                rating: 4.9,
                reviews: 342,
                vendor: 'Green Valley Farms',
                quickAction: 'addToCart',
                showOnHome: true,
                inStock: true
            },
            {
                productId: '3',
                productName: 'Heirloom Tomato Seeds',
                productPrice: 450,
                carouselImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
                badge: 'sale',
                rating: 4.7,
                reviews: 89,
                vendor: 'Heritage Seeds Co',
                quickAction: 'viewDetails',
                showOnHome: true,
                inStock: true
            },
            {
                productId: '4',
                productName: 'Bio Fertilizer Mix',
                productPrice: 1850,
                carouselImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80',
                badge: 'none',
                rating: 4.6,
                reviews: 67,
                vendor: 'EcoGrow Solutions',
                quickAction: 'addToCart',
                showOnHome: true,
                inStock: true
            }
        ]
    };

    const marketplaceConfig = config?.marketplace || defaultConfig;
    const { title, subtitle, viewAllLink, carousel, featuredProducts } = marketplaceConfig;

    // Filter active products
    const activeProducts = (featuredProducts || defaultConfig.featuredProducts)
        .filter(p => p.showOnHome !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const getBadgeStyles = (badge) => {
        switch (badge) {
            case 'new': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            case 'bestseller': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
            case 'sale': return 'bg-gradient-to-r from-red-500 to-pink-500 text-white';
            default: return '';
        }
    };

    const getBadgeLabel = (badge) => {
        switch (badge) {
            case 'new': return '✨ New';
            case 'bestseller': return '🔥 Best Seller';
            case 'sale': return '💰 Sale';
            default: return '';
        }
    };

    const toggleLike = (productId) => {
        setLikedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    if (activeProducts.length === 0) {
        return null;
    }

    return (
        <section id="marketplace" className="relative py-24 bg-gradient-to-b from-slate-50 via-white to-emerald-50/30 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
            </div>

            <div className="relative container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full mb-6"
                    >
                        <Package className="text-emerald-600" size={20} />
                        <span className="text-emerald-700 font-semibold text-sm">Marketplace</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
                    >
                        {title || defaultConfig.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto"
                    >
                        {subtitle || defaultConfig.subtitle}
                    </motion.p>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-6 mb-8"
                    >
                        <div className="flex items-center gap-2 text-slate-600">
                            <Shield className="text-emerald-600" size={20} />
                            <span className="text-sm font-medium">Verified Vendors</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Zap className="text-emerald-600" size={20} />
                            <span className="text-sm font-medium">Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Star className="text-emerald-600" size={20} fill="currentColor" />
                            <span className="text-sm font-medium">Quality Assured</span>
                        </div>
                    </motion.div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {activeProducts.map((product, index) => (
                        <motion.div
                            key={product.productId || index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onMouseEnter={() => setHoveredProduct(product.productId)}
                            onMouseLeave={() => setHoveredProduct(null)}
                            className="group relative"
                        >
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 border border-slate-100 h-full flex flex-col">
                                {/* Product Image */}
                                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                                    <img
                                        src={product.carouselImage || 'https://via.placeholder.com/400'}
                                        alt={product.productName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                    />

                                    {/* Badge Overlay */}
                                    {product.badge && product.badge !== 'none' && (
                                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${getBadgeStyles(product.badge)}`}>
                                            {getBadgeLabel(product.badge)}
                                        </div>
                                    )}

                                    {/* Like Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => toggleLike(product.productId)}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                                    >
                                        <Heart
                                            size={18}
                                            className={likedProducts.has(product.productId) ? 'text-red-500 fill-red-500' : 'text-slate-400'}
                                        />
                                    </motion.button>

                                    {/* Stock Status */}
                                    {!product.inStock && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">Out of Stock</span>
                                        </div>
                                    )}

                                    {/* Hover Overlay with Actions */}
                                    <AnimatePresence>
                                        {hoveredProduct === product.productId && product.inStock && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center pb-6"
                                            >
                                                <div className="flex gap-3">
                                                    <motion.button
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => navigate(viewAllLink)}
                                                        className="px-4 py-2.5 bg-white text-slate-900 rounded-xl font-semibold flex items-center gap-2 shadow-lg text-sm"
                                                    >
                                                        <Eye size={16} />
                                                        View
                                                    </motion.button>
                                                    <motion.button
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.15 }}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg text-sm"
                                                    >
                                                        <ShoppingCart size={16} />
                                                        Add
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Product Info */}
                                <div className="p-5 flex-1 flex flex-col">
                                    {/* Vendor */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <Shield size={12} className="text-emerald-600" />
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">{product.vendor}</span>
                                    </div>

                                    {/* Product Name */}
                                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 flex-1">
                                        {product.productName}
                                    </h3>

                                    {/* Rating */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Star size={14} className="text-amber-400 fill-amber-400" />
                                            <span className="text-sm font-semibold text-slate-700">{product.rating}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">({product.reviews} reviews)</span>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-emerald-600">
                                            ₹{product.productPrice?.toLocaleString('en-IN')}
                                        </span>
                                        {product.originalPrice && product.originalPrice > product.productPrice && (
                                            <span className="text-sm text-slate-400 line-through">
                                                ₹{product.originalPrice?.toLocaleString('en-IN')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Discount Badge */}
                                    {product.originalPrice && product.originalPrice > product.productPrice && (
                                        <div className="mt-2">
                                            <span className="inline-block px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded">
                                                Save {Math.round(((product.originalPrice - product.productPrice) / product.originalPrice) * 100)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trending Indicator */}
                            {product.badge === 'bestseller' && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <TrendingUp size={20} className="text-white" />
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* View All CTA */}
                {viewAllLink && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <motion.button
                            onClick={() => navigate(viewAllLink)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all"
                        >
                            Explore Full Marketplace
                            <ExternalLink size={20} />
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default ModernMarketplace;
