import React from 'react';
import { motion } from 'framer-motion';
import { Handshake, Users, TrendingUp, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModernNavbar from '../components/ModernNavbar';
import ModernFooter from '../components/ModernFooter';

const Partners = () => {
    const navigate = useNavigate();

    const partnerTypes = [
        {
            icon: Users,
            title: 'Technology Partners',
            description: 'Integrate your solutions with our platform to reach thousands of farmers.',
            benefits: ['API Access', 'Co-marketing', 'Revenue Share']
        },
        {
            icon: TrendingUp,
            title: 'Distribution Partners',
            description: 'Help us expand our reach in new markets and regions.',
            benefits: ['Commission Model', 'Training Support', 'Marketing Materials']
        },
        {
            icon: Award,
            title: 'Research Partners',
            description: 'Collaborate on agricultural research and innovation projects.',
            benefits: ['Data Access', 'Joint Publications', 'Funding Opportunities']
        }
    ];

    const currentPartners = [
        { name: 'AgriTech Solutions', logo: '🌾' },
        { name: 'FarmData Systems', logo: '📊' },
        { name: 'GreenGrow Inc', logo: '🌱' },
        { name: 'CropTech Labs', logo: '🔬' }
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
                        <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-6">
                            <Handshake className="text-purple-600" size={20} />
                            <span className="text-purple-700 font-semibold text-sm">Partner with Us</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            Grow Together with
                            <span className="block text-emerald-600 mt-2">AgriSense</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Join our ecosystem of partners helping to transform agriculture through technology and innovation.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Partner Types */}
            <section className="py-20 px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Partnership Opportunities</h2>
                        <p className="text-lg text-slate-600">Choose the partnership model that fits your goals</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {partnerTypes.map((type, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:shadow-2xl transition-all group"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                    <type.icon className="text-white" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">{type.title}</h3>
                                <p className="text-slate-600 mb-6">{type.description}</p>
                                <div className="space-y-2">
                                    {type.benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                            <CheckCircle size={16} className="text-emerald-600" />
                                            {benefit}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Current Partners */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Partners</h2>
                        <p className="text-lg text-slate-600">Trusted by leading organizations</p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {currentPartners.map((partner, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center"
                            >
                                <div className="text-5xl mb-4">{partner.logo}</div>
                                <p className="font-semibold text-slate-700">{partner.name}</p>
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
                            Ready to Partner with Us?
                        </h2>
                        <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                            Let's discuss how we can work together to create value for farmers worldwide.
                        </p>
                        <button 
                            onClick={() => navigate('/contact')}
                            className="px-8 py-4 bg-white text-emerald-600 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-lg inline-flex items-center gap-2"
                        >
                            Get in Touch
                            <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            <ModernFooter />
        </div>
    );
};

export default Partners;
