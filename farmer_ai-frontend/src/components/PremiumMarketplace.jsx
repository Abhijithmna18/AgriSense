import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const products = [
    {
        id: 1,
        name: 'Premium Saffron Bulbs',
        category: 'Seeds',
        price: '₹12,500',
        image: 'https://images.unsplash.com/photo-1599909533730-c1b6e3c1e9d8?w=600&q=80',
    },
    {
        id: 2,
        name: 'Heirloom Tomatoes',
        category: 'Produce',
        price: '₹450',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80',
    },
    {
        id: 3,
        name: 'Organic Wheat Seeds',
        category: 'Seeds',
        price: '₹2,800',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
    },
];

export const PremiumMarketplace = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    return (
        <section className="py-24 px-6 bg-gradient-to-b from-transparent to-[#1A1A1A]/30">
            <div className="container mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 mb-6 glass rounded-full"
                    >
                        <span className="text-sm text-[#D4AF37] font-medium">Premium Marketplace</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-[#F9F8F4] mb-4"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        Curated Excellence
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-[#F9F8F4]/70 text-lg max-w-2xl mx-auto font-light"
                    >
                        Discover premium agricultural products from verified suppliers
                    </motion.p>
                </div>

                {/* Carousel */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <AnimatePresence mode="wait">
                            {products.map((product, index) => {
                                const offset = (index - currentIndex + products.length) % products.length;
                                const isCenter = offset === 0;

                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: isCenter ? 1 : 0.4,
                                            scale: isCenter ? 1 : 0.9,
                                            zIndex: isCenter ? 10 : 0,
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="group cursor-pointer"
                                    >
                                        <div className="glass rounded-3xl overflow-hidden hover:border-[#D4AF37]/60 transition-all duration-300">
                                            {/* Image */}
                                            <div className="relative aspect-[3/4] overflow-hidden">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B231E] via-transparent to-transparent opacity-60"></div>

                                                {/* Add Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#F9F8F4]/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Plus size={20} className="text-[#F9F8F4]" strokeWidth={1.5} />
                                                </motion.button>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <div className="text-xs text-[#D4AF37] mb-2 font-medium tracking-wide uppercase">
                                                    {product.category}
                                                </div>
                                                <h3
                                                    className="text-xl text-[#F9F8F4] mb-3"
                                                    style={{ fontFamily: 'var(--font-serif)' }}
                                                >
                                                    {product.name}
                                                </h3>
                                                <div className="text-2xl text-[#D4AF37] font-semibold">
                                                    {product.price}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center gap-4 mt-12">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={prevSlide}
                            className="w-12 h-12 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/60 transition-colors"
                        >
                            <ChevronLeft size={24} className="text-[#F9F8F4]" strokeWidth={1.5} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={nextSlide}
                            className="w-12 h-12 rounded-full glass flex items-center justify-center hover:border-[#D4AF37]/60 transition-colors"
                        >
                            <ChevronRight size={24} className="text-[#F9F8F4]" strokeWidth={1.5} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
};
