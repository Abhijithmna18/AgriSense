import React from 'react';
import { motion } from 'framer-motion';


import * as Icons from 'lucide-react';

const ModernFeatures = ({ config }) => {

    const getIcon = (iconName) => {
        const IconComponent = Icons[iconName] || Icons.HelpCircle;
        return <IconComponent size={32} />;
    };

    const defaultFeatures = [
        {
            icon: "Cpu",
            title: "AI Advisory",
            description: "Get real-time, data-driven recommendations for crop management and disease prevention.",
            color: "bg-blue-50 text-blue-600"
        },
        {
            icon: "Sprout",
            title: "Crop Health",
            description: "Monitor plant vitality with advanced satellite imagery and ground sensor integration.",
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            icon: "BarChart3",
            title: "Yield Analytics",
            description: "Predict harvest outcomes and optimize resource allocation for maximum profitability.",
            color: "bg-purple-50 text-purple-600"
        },
        {
            icon: "CloudSun",
            title: "Smart Weather",
            description: "Hyper-local weather forecasts tailored specifically for agricultural planning.",
            color: "bg-amber-50 text-amber-600"
        }
    ];

    const featuresToRender = (config?.cards || defaultFeatures).filter(card => card.active !== false);
    const title = config?.title || "Powerful Features for Modern Farming";
    const description = config?.description || "Our platform integrates cutting-edge technology to provide you with actionable insights.";

    // Grid columns configuration
    const gridCols = config?.gridColumns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

    return (
        <section id="features" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        {title}
                    </h2>
                    <p className="text-lg text-slate-600">
                        {description}
                    </p>
                </div>

                <div className={`grid md:grid-cols-2 ${gridCols} gap-8`}>
                    {featuresToRender.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 group"
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color || 'bg-slate-100 text-slate-600'} group-hover:scale-110 transition-transform duration-300`}>
                                {/* Check if feature.icon is a string (dynamic) or object (static default) */}
                                {typeof feature.icon === 'string' ? getIcon(feature.icon) : feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-fresh-green transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ModernFeatures;
