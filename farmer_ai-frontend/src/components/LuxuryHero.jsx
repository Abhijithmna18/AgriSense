import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fadeInUp, staggerContainer, buttonHover } from '../utils/animations';

export const LuxuryHero = () => {
    const navigate = useNavigate();
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
                    alt="Golden wheat field"
                    className="w-full h-full object-cover"
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#0B231E]"></div>
            </div>

            {/* Content */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="relative z-10 container mx-auto px-6 text-center"
            >
                {/* Glass Badge */}
                <motion.div
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-8 glass rounded-full"
                >
                    <Sparkles size={16} className="text-[#D4AF37]" strokeWidth={1.5} />
                    <span className="text-sm font-light tracking-wide text-[#F9F8F4]">
                        The Future of Farming
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={fadeInUp}
                    className="text-[#F9F8F4] mb-6 max-w-5xl mx-auto"
                    style={{ fontFamily: 'var(--font-serif)' }}
                >
                    Intelligent Agriculture for a Smarter Future
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    variants={fadeInUp}
                    className="text-[#F9F8F4]/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light"
                >
                    AI-powered insights, real-time analytics, and farm-to-market traceability.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    {/* Primary CTA */}
                    <motion.button
                        onClick={() => navigate('/register')}
                        variants={buttonHover}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                        className="px-8 py-4 bg-[#D4AF37] text-[#0B231E] rounded-full font-semibold text-lg shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30 transition-shadow"
                    >
                        Get Started
                    </motion.button>

                    {/* Secondary CTA */}
                    <motion.button
                        variants={buttonHover}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                        className="px-8 py-4 bg-transparent border-2 border-[#F9F8F4] text-[#F9F8F4] rounded-full font-semibold text-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                    >
                        <Play size={20} strokeWidth={2} />
                        Watch Demo
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
            >
                <div className="w-6 h-10 border-2 border-[#D4AF37]/50 rounded-full flex justify-center pt-2">
                    <div className="w-1 h-3 bg-[#D4AF37] rounded-full"></div>
                </div>
            </motion.div>
        </section>
    );
};
