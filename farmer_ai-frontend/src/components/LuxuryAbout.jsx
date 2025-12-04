import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';

export const LuxuryAbout = () => {
    return (
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Masked Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                        className="relative"
                    >
                        <div className="relative overflow-hidden rounded-[3rem] aspect-[4/5]">
                            <img
                                src="https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=800&q=80"
                                alt="Agricultural drone technology"
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B231E]/80 to-transparent"></div>
                        </div>

                        {/* Decorative Element */}
                        <div className="absolute -bottom-6 -right-6 w-48 h-48 border border-[#D4AF37]/30 rounded-[3rem] -z-10"></div>
                    </motion.div>

                    {/* Right: Typography */}
                    <motion.div
                        initial={{ opacity: 0, x: 60 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                    >
                        {/* Gold Line Separator */}
                        <div className="w-16 h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent mb-8"></div>

                        {/* Title */}
                        <h2
                            className="text-[#F9F8F4] mb-6"
                            style={{ fontFamily: 'var(--font-serif)' }}
                        >
                            Precision meets Nature
                        </h2>

                        {/* Description */}
                        <div className="space-y-4 text-[#F9F8F4]/70 leading-relaxed">
                            <p className="text-lg font-light">
                                Our machine learning platform analyzes millions of data points—from soil composition
                                to weather patterns—delivering actionable insights that transform traditional farming
                                into a data-driven science.
                            </p>

                            <p className="text-lg font-light">
                                By combining satellite imagery, IoT sensors, and advanced predictive models, we
                                empower farmers to make informed decisions that increase yields while reducing
                                environmental impact.
                            </p>

                            <p className="text-lg font-light">
                                From precision irrigation to optimal harvest timing, every recommendation is backed
                                by rigorous analysis and real-world validation across thousands of farms globally.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-[#D4AF37]/20">
                            <div>
                                <div className="text-3xl font-bold text-[#D4AF37] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                                    98%
                                </div>
                                <div className="text-sm text-[#F9F8F4]/60 font-light">Accuracy Rate</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#D4AF37] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                                    45%
                                </div>
                                <div className="text-sm text-[#F9F8F4]/60 font-light">Yield Increase</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-[#D4AF37] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                                    24/7
                                </div>
                                <div className="text-sm text-[#F9F8F4]/60 font-light">Monitoring</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
