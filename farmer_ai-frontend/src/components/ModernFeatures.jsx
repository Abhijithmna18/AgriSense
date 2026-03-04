import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import {
    Sparkles,
    ArrowRight,
    Check,
    Zap,
    Shield,
    TrendingUp
} from 'lucide-react';

const ModernFeatures = ({ config }) => {
    const { t } = useTranslation();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(0);

    const getIcon = (iconName) => {
        const IconComponent = Icons[iconName] || Icons.HelpCircle;
        return <IconComponent size={28} strokeWidth={2} />;
    };

    const defaultFeatures = [
        {
            icon: "Cpu",
            title: t('features_section.f1_title', "AI-Powered Advisory"),
            description: t('features_section.f1_desc', "Get real-time, data-driven recommendations for crop management and disease prevention powered by advanced machine learning."),
            color: "bg-gradient-to-br from-blue-500 to-blue-600",
            lightColor: "bg-blue-50",
            textColor: "text-blue-600",
            benefits: t('features_section.f1_benefits', { returnObjects: true, defaultValue: ["24/7 AI Support", "Predictive Analytics", "Custom Recommendations"] }),
            badge: t('features_section.f1_badge', "Most Popular")
        },
        {
            icon: "Sprout",
            title: t('features_section.f2_title', "Crop Health Monitoring"),
            description: t('features_section.f2_desc', "Monitor plant vitality with advanced satellite imagery, ground sensor integration, and real-time health diagnostics."),
            color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
            lightColor: "bg-emerald-50",
            textColor: "text-emerald-600",
            benefits: t('features_section.f2_benefits', { returnObjects: true, defaultValue: ["Satellite Imagery", "Disease Detection", "Growth Tracking"] }),
            badge: null
        },
        {
            icon: "BarChart3",
            title: t('features_section.f3_title', "Yield Analytics"),
            description: t('features_section.f3_desc', "Predict harvest outcomes and optimize resource allocation for maximum profitability with data-driven insights."),
            color: "bg-gradient-to-br from-purple-500 to-purple-600",
            lightColor: "bg-purple-50",
            textColor: "text-purple-600",
            benefits: t('features_section.f3_benefits', { returnObjects: true, defaultValue: ["Harvest Prediction", "ROI Optimization", "Resource Planning"] }),
            badge: null
        },
        {
            icon: "CloudSun",
            title: t('features_section.f4_title', "Smart Weather Intelligence"),
            description: t('features_section.f4_desc', "Hyper-local weather forecasts tailored specifically for agricultural planning with precision accuracy."),
            color: "bg-gradient-to-br from-amber-500 to-orange-500",
            lightColor: "bg-amber-50",
            textColor: "text-amber-600",
            benefits: t('features_section.f4_benefits', { returnObjects: true, defaultValue: ["Micro-Climate Data", "7-Day Forecasts", "Alert System"] }),
            badge: null
        },
        {
            icon: "ShoppingCart",
            title: t('features_section.f5_title', "Marketplace Access"),
            description: t('features_section.f5_desc', "Connect directly with verified vendors and buyers for transparent, fair-priced agricultural transactions."),
            color: "bg-gradient-to-br from-pink-500 to-rose-600",
            lightColor: "bg-pink-50",
            textColor: "text-pink-600",
            benefits: t('features_section.f5_benefits', { returnObjects: true, defaultValue: ["Verified Vendors", "Secure Payments", "Price Transparency"] }),
            badge: null
        },
        {
            icon: "DollarSign",
            title: t('features_section.f6_title', "Financial Services"),
            description: t('features_section.f6_desc', "Access loans, insurance, and financial planning tools designed specifically for farmers and agricultural businesses."),
            color: "bg-gradient-to-br from-green-500 to-teal-600",
            lightColor: "bg-green-50",
            textColor: "text-green-600",
            benefits: t('features_section.f6_benefits', { returnObjects: true, defaultValue: ["Quick Loans", "Crop Insurance", "Financial Planning"] }),
            badge: t('features_section.f6_badge', "New")
        }
    ];

    const featuresToRender = (config?.cards || defaultFeatures).filter(card => card.active !== false);
    const title = t('features_section.header_title', config?.title || "Powerful Features for Modern Farming");
    const subtitle = t('features_section.header_subtitle', config?.subtitle || "Everything you need to succeed");
    const description = t('features_section.header_description', config?.description || "Our platform integrates cutting-edge technology to provide you with actionable insights and tools for smarter farming.");

    return (
        <section id="features" className="relative py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-300 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
            </div>

            <div className="relative container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-blue-100 px-4 py-2 rounded-full mb-6"
                    >
                        <Sparkles className="text-emerald-600" size={20} />
                        <span className="text-emerald-700 font-semibold text-sm">{subtitle}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
                    >
                        {title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-600 leading-relaxed"
                    >
                        {description}
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {featuresToRender.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="relative group"
                        >
                            <div className="relative h-full p-8 rounded-3xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50 border-2 border-slate-100 hover:border-slate-200 transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden">
                                {/* Gradient Overlay on Hover */}
                                <div className={`absolute inset-0 ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                {/* Badge */}
                                {feature.badge && (
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 ${feature.color} text-white text-xs font-bold rounded-full shadow-lg`}>
                                            {feature.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Icon */}
                                <motion.div
                                    animate={{
                                        scale: hoveredIndex === index ? 1.1 : 1,
                                        rotate: hoveredIndex === index ? 5 : 0
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className={`relative w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
                                >
                                    <div className="text-white">
                                        {typeof feature.icon === 'string' ? getIcon(feature.icon) : feature.icon}
                                    </div>
                                    {/* Glow Effect */}
                                    <div className={`absolute inset-0 ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                                </motion.div>

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-all">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed mb-6">
                                        {feature.description}
                                    </p>

                                    {/* Benefits List */}
                                    {feature.benefits && (
                                        <div className="space-y-2 mb-6">
                                            {feature.benefits.map((benefit, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.1 + idx * 0.05 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className={`w-5 h-5 rounded-full ${feature.lightColor} flex items-center justify-center flex-shrink-0`}>
                                                        <Check size={12} className={feature.textColor} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-sm text-slate-600 font-medium">{benefit}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Learn More Link */}
                                    <motion.button
                                        whileHover={{ x: 5 }}
                                        className={`flex items-center gap-2 ${feature.textColor} font-semibold text-sm group/btn`}
                                    >
                                        {t('features_section.learn_more', 'Learn More')}
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </motion.button>
                                </div>

                                {/* Decorative Corner Element */}
                                <div className={`absolute -bottom-8 -right-8 w-32 h-32 ${feature.lightColor} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            </div>

                            {/* Floating Animation on Hover */}
                            <AnimatePresence>
                                {hoveredIndex === index && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10"
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 rounded-3xl p-12 text-center overflow-hidden shadow-2xl">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                                <Zap className="text-white" size={18} />
                                <span className="text-white font-semibold text-sm">{t('features_section.cta_badge', 'Get Started Today')}</span>
                            </div>

                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                {t('features_section.cta_title', 'Ready to Transform Your Farm?')}
                            </h3>
                            <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                                {t('features_section.cta_description', 'Join thousands of farmers who are already using AgriSense to increase yields, reduce costs, and make smarter decisions.')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-emerald-600 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    {t('features_section.cta_start', 'Start Free Trial')}
                                    <ArrowRight size={20} />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-emerald-800/50 backdrop-blur-sm text-white rounded-full font-bold border-2 border-white/30 hover:bg-emerald-800/70 transition-all"
                                >
                                    {t('features_section.cta_watch', 'Watch Demo')}
                                </motion.button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap justify-center gap-8 mt-10 pt-8 border-t border-white/20">
                                <div className="flex items-center gap-2 text-white">
                                    <Shield size={20} />
                                    <span className="text-sm font-medium">{t('features_section.trust_secure', 'Secure & Trusted')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white">
                                    <TrendingUp size={20} />
                                    <span className="text-sm font-medium">{t('features_section.trust_users', '10K+ Active Users')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white">
                                    <Check size={20} />
                                    <span className="text-sm font-medium">{t('features_section.trust_nocredit', 'No Credit Card Required')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ModernFeatures;
