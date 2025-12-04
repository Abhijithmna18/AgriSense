import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield } from 'lucide-react';
import { fadeInUp, staggerContainer, goldBorderGlow } from '../utils/animations';

const features = [
    {
        icon: Brain,
        title: 'AI Disease Detection',
        description: 'Advanced machine learning algorithms identify crop diseases early, preventing yield loss and optimizing treatment strategies.',
    },
    {
        icon: TrendingUp,
        title: 'Smart Yield Forecasting',
        description: 'Predictive analytics powered by satellite imagery and weather data to maximize harvest outcomes and market timing.',
    },
    {
        icon: Shield,
        title: 'Blockchain Traceability',
        description: 'Immutable supply chain tracking from seed to sale, ensuring transparency and premium pricing for quality produce.',
    },
];

export const FeatureCards = () => {
    return (
        <section className="py-24 px-6 relative">
            <div className="container mx-auto">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            initial="rest"
                            whileHover="hover"
                            className="relative group"
                        >
                            <motion.div
                                variants={goldBorderGlow}
                                className="glass rounded-3xl p-8 h-full flex flex-col transition-all duration-500"
                            >
                                {/* Icon Container */}
                                <div className="mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
                                        <feature.icon size={32} className="text-[#0B231E]" strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3
                                    className="text-2xl mb-4 text-[#F9F8F4]"
                                    style={{ fontFamily: 'var(--font-serif)' }}
                                >
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-[#F9F8F4]/70 leading-relaxed font-light flex-grow">
                                    {feature.description}
                                </p>

                                {/* Hover Indicator */}
                                <div className="mt-6 flex items-center gap-2 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <span className="text-sm font-medium">Learn more</span>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        className="transform group-hover:translate-x-1 transition-transform"
                                    >
                                        <path
                                            d="M6 12L10 8L6 4"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
