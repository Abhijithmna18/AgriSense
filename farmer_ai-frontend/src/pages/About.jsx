import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Target, Users, Lightbulb, Award, TrendingUp, Heart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModernNavbar from '../components/ModernNavbar';
import ModernFooter from '../components/ModernFooter';

const About = () => {
    const navigate = useNavigate();

    const stats = [
        { value: '10K+', label: 'Active Farmers' },
        { value: '500+', label: 'Verified Vendors' },
        { value: '95%', label: 'Satisfaction Rate' },
        { value: '24/7', label: 'AI Support' }
    ];

    const values = [
        {
            icon: Heart,
            title: 'Farmer-First',
            description: 'Every decision we make prioritizes the wellbeing and success of farmers.'
        },
        {
            icon: Lightbulb,
            title: 'Innovation',
            description: 'Leveraging cutting-edge AI and ML to solve real agricultural challenges.'
        },
        {
            icon: Shield,
            title: 'Trust & Transparency',
            description: 'Building a marketplace where fairness and honesty are guaranteed.'
        },
        {
            icon: TrendingUp,
            title: 'Sustainable Growth',
            description: 'Promoting practices that ensure long-term prosperity for all stakeholders.'
        }
    ];

    const team = [
        {
            role: 'Mission',
            icon: Target,
            description: 'To empower farmers with intelligent tools that maximize yield, minimize risk, and ensure fair market access.'
        },
        {
            role: 'Vision',
            icon: Award,
            description: 'A future where every farmer has access to world-class agricultural intelligence and transparent marketplaces.'
        },
        {
            role: 'Community',
            icon: Users,
            description: 'Building a thriving ecosystem connecting farmers, vendors, agronomists, and technology partners.'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
            <ModernNavbar />
            
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-6">
                            <Sprout className="text-emerald-600" size={20} />
                            <span className="text-emerald-700 font-semibold text-sm">About AgriSense</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            Revolutionizing Agriculture
                            <span className="block text-emerald-600 mt-2">Through Intelligence</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            AgriSense combines artificial intelligence, machine learning, and agricultural expertise 
                            to create a comprehensive platform that empowers farmers to make data-driven decisions.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-slate-600 font-medium">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Community */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8">
                        {team.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                                    <item.icon className="text-emerald-600" size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                    {item.role}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            The principles that guide everything we do at AgriSense
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-6 p-6 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <value.icon className="text-emerald-600" size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-slate-600">
                                        {value.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="py-20 px-6 bg-gradient-to-br from-emerald-50 to-white">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">
                            What We Offer
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            A comprehensive suite of tools designed for modern agriculture
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'AI Crop Recommendations', desc: 'ML-powered suggestions based on soil, weather, and market trends' },
                            { title: 'Pest & Disease Prediction', desc: 'Early warning system to prevent crop losses' },
                            { title: 'Smart Marketplace', desc: 'Direct connection to verified vendors with fair pricing' },
                            { title: 'Weather Intelligence', desc: 'Hyperlocal forecasts and climate insights' },
                            { title: 'Financial Services', desc: 'Access to loans, insurance, and financial planning' },
                            { title: 'Expert Consultations', desc: '24/7 access to agronomists and agricultural experts' }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                            >
                                <h3 className="text-lg font-bold text-slate-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-3xl p-12 text-center text-white shadow-2xl"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Transform Your Farm?
                        </h2>
                        <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of farmers who are already using AgriSense to increase yields, 
                            reduce costs, and access better markets.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/register')}
                                className="px-8 py-4 bg-white text-emerald-600 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-lg"
                            >
                                Get Started Free
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-emerald-800 text-white rounded-full font-bold hover:bg-emerald-900 transition-colors"
                            >
                                Sign In
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <ModernFooter />
        </div>
    );
};

export default About;
