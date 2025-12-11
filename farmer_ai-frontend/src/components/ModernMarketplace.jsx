import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, ArrowRight, Tag } from 'lucide-react';

const products = [
    {
        name: "Organic Wheat Seeds",
        price: "₹1,200",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&q=80",
        category: "Seeds",
        tag: "Best Seller"
    },
    {
        name: "Smart Soil Sensor",
        price: "₹4,500",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80",
        category: "Tools",
        tag: "Tech"
    },
    {
        name: "Premium Fertilizer",
        price: "₹850",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=500&q=80",
        category: "Nutrients",
        tag: "Organic"
    },
    {
        name: "Harvest Basket",
        price: "₹1,500",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=500&q=80",
        category: "Equipment",
        tag: "Durable"
    }
];

const ModernMarketplace = () => {
    return (
        <section id="marketplace" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-muted-green font-semibold tracking-wider uppercase text-xs">Agri-Store</span>
                        <h2 className="text-3xl font-bold text-slate-900 mt-2">
                            Marketplace
                        </h2>
                    </div>
                    <button className="hidden md:flex items-center gap-2 text-muted-green font-medium hover:text-emerald-700 transition-colors text-sm">
                        View All <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-100"
                        >
                            <div className="relative h-64 overflow-hidden bg-slate-50">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-slate-700 shadow-sm uppercase tracking-wide">
                                        {product.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="mb-2">
                                    <h3 className="font-bold text-slate-900 text-base group-hover:text-muted-green transition-colors line-clamp-1">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star size={12} className="text-amber-400 fill-current" />
                                        <span className="text-xs text-slate-500 font-medium">{product.rating}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-lg font-bold text-slate-900">{product.price}</span>
                                    <button className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-muted-green hover:text-white transition-colors">
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ModernMarketplace;
