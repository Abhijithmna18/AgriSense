import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModernHero = ({ config }) => {
    const navigate = useNavigate();

    const headline = config?.headline || "Cultivating a Smarter Future";
    // Handle HTML in headline if simplified, or just render text. The original had <br/>.
    // I'll render it as is or split it. For now, let's treat it as simple text or use a dangerouslySetInnerHTML if we want rich text later.
    // But the design had specific span styling.
    // Let's try to preserve the design for the default case, but render simple text if config is present.

    // Better approach: Check if config is present.

    const subheadline = config?.subheadline || "Harness the power of artificial intelligence to optimize yields, monitor crop health, and make data-driven decisions for sustainable farming.";

    const trustIndicators = config?.trustIndicators && config.trustIndicators.length > 0
        ? config.trustIndicators
        : [
            { value: "30%", label: "Yield Increase" },
            { value: "95%", label: "Accuracy Rate" },
            { value: "24/7", label: "Real-time Monitoring" }
        ];

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-ivory">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
                    alt="Sustainable Farm"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 pt-20">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-fresh-green bg-mint-leaf rounded-full uppercase">
                            AI-Powered Agriculture
                        </span>

                        {config?.headline ? (
                            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6 font-sans">
                                {config.headline}
                            </h1>
                        ) : (
                            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6 font-sans">
                                Cultivating a <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fresh-green to-emerald-600">
                                    Smarter Future
                                </span>
                            </h1>
                        )}

                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                            {subheadline}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/register')}
                                className="px-8 py-4 bg-fresh-green text-white rounded-full font-semibold text-lg shadow-xl shadow-fresh-green/30 hover:bg-emerald-600 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
                            >
                                Get Started
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold text-lg hover:border-fresh-green hover:text-fresh-green transition-colors flex items-center justify-center gap-2 shadow-sm">
                                <Play size={20} className="fill-current" />
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="mt-16 grid grid-cols-3 gap-8 border-t border-slate-200/60 pt-8 max-w-2xl"
                    >
                        {trustIndicators.map((stat, index) => (
                            <div key={index}>
                                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ModernHero;
