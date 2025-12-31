import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, ArrowRight } from 'lucide-react';

const ModernMarketplace = ({ config }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

    // Default fallback data
    const defaultConfig = {
        title: 'Shop Our Best-Sellers',
        subtitle: 'Premium agricultural products and solutions',
        viewAllLink: '/marketplace',
        carousel: {
            autoPlay: true,
            slideDuration: 3,
            navigationStyle: 'dots',
            itemsPerView: { desktop: 4, tablet: 2, mobile: 1 }
        },
        featuredProducts: [
            {
                productId: '1',
                productName: 'Premium Saffron Bulbs',
                productPrice: 12500,
                carouselImage: 'https://images.unsplash.com/photo-1599909533730-c1b6e3c1e9d8?w=600&q=80',
                badge: 'new',
                quickAction: 'viewDetails',
                showOnHome: true
            },
            {
                productId: '2',
                productName: 'Organic Wheat Seeds',
                productPrice: 2800,
                carouselImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
                badge: 'bestseller',
                quickAction: 'addToCart',
                showOnHome: true
            },
            {
                productId: '3',
                productName: 'Heirloom Tomatoes',
                productPrice: 450,
                carouselImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
                badge: 'none',
                quickAction: 'viewDetails',
                showOnHome: true
            }
        ]
    };

    const marketplaceConfig = config?.marketplace || defaultConfig;
    const { title, subtitle, viewAllLink, carousel, featuredProducts } = marketplaceConfig;

    // Filter active products
    const activeProducts = (featuredProducts || defaultConfig.featuredProducts)
        .filter(p => p.showOnHome !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Auto-play effect
    useEffect(() => {
        if (carousel?.autoPlay && activeProducts.length > 1) {
            setAutoPlayEnabled(true);
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % activeProducts.length);
            }, (carousel.slideDuration || 3) * 1000);
            return () => clearInterval(interval);
        }
    }, [carousel?.autoPlay, carousel?.slideDuration, activeProducts.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % activeProducts.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + activeProducts.length) % activeProducts.length);
    };

    const getBadgeStyles = (badge) => {
        switch (badge) {
            case 'new': return 'bg-blue-500 text-white';
            case 'bestseller': return 'bg-amber-500 text-white';
            case 'sale': return 'bg-red-500 text-white';
            default: return '';
        }
    };

    const getBadgeLabel = (badge) => {
        switch (badge) {
            case 'new': return 'New';
            case 'bestseller': return 'Best Seller';
            case 'sale': return 'Sale';
            default: return '';
        }
    };

    if (activeProducts.length === 0) {
        return null; // Graceful degradation
    }

    return (
        <section id="marketplace" className="py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
                    >
                        {title || defaultConfig.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 mb-6"
                    >
                        {subtitle || defaultConfig.subtitle}
                    </motion.p>
                    {viewAllLink && (
                        <motion.a
                            href={viewAllLink}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                        >
                            View All Products
                            <ArrowRight size={18} />
                        </motion.a>
                    )}
                </div>

                {/* Carousel */}
                <div className="relative max-w-7xl mx-auto">
                    <div className={`grid gap-6 ${carousel?.itemsPerView?.desktop === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'
                        } md:grid-cols-${carousel?.itemsPerView?.tablet || 2} grid-cols-${carousel?.itemsPerView?.mobile || 1}`}>
                        <AnimatePresence mode="wait">
                            {activeProducts.map((product, index) => (
                                <motion.div
                                    key={product.productId || index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="group"
                                >
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                                        {/* Product Image */}
                                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                                            <img
                                                src={product.carouselImage || 'https://via.placeholder.com/400'}
                                                alt={product.productName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                loading="lazy"
                                            />

                                            {/* Badge Overlay */}
                                            {product.badge && product.badge !== 'none' && (
                                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeStyles(product.badge)}`}>
                                                    {getBadgeLabel(product.badge)}
                                                </div>
                                            )}

                                            {/* Quick Action Button */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                {product.quickAction === 'addToCart' ? (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                                                    >
                                                        <ShoppingCart size={18} />
                                                        Quick Add
                                                    </motion.button>
                                                ) : (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                                                    >
                                                        <Eye size={18} />
                                                        View Details
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-6">
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                                                {product.productName}
                                            </h3>
                                            <div className="text-2xl font-bold text-emerald-600">
                                                ₹{product.productPrice?.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Controls */}
                    {carousel?.navigationStyle === 'arrows' && activeProducts.length > 1 && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={prevSlide}
                                className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <ChevronLeft size={24} className="text-slate-900" />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={nextSlide}
                                className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                                <ChevronRight size={24} className="text-slate-900" />
                            </motion.button>
                        </div>
                    )}

                    {/* Dot Indicators */}
                    {carousel?.navigationStyle === 'dots' && activeProducts.length > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {activeProducts.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-emerald-600 w-8' : 'bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ModernMarketplace;
