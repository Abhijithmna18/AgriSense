import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ArrowRight, Users, Heart, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModernNavbar from '../components/ModernNavbar';
import ModernFooter from '../components/ModernFooter';

const Careers = () => {
    const navigate = useNavigate();

    const openPositions = [
        {
            title: 'Senior Full Stack Developer',
            department: 'Engineering',
            location: 'Remote / San Francisco',
            type: 'Full-time',
            description: 'Build scalable agricultural technology solutions using React, Node.js, and AI/ML frameworks.'
        },
        {
            title: 'Agricultural Data Scientist',
            department: 'Data Science',
            location: 'Remote / Hybrid',
            type: 'Full-time',
            description: 'Develop machine learning models for crop prediction, pest detection, and yield optimization.'
        },
        {
            title: 'Product Designer',
            department: 'Design',
            location: 'Remote',
            type: 'Full-time',
            description: 'Create intuitive user experiences for farmers and agricultural professionals.'
        },
        {
            title: 'DevOps Engineer',
            department: 'Engineering',
            location: 'Remote / San Francisco',
            type: 'Full-time',
            description: 'Manage cloud infrastructure, CI/CD pipelines, and ensure platform reliability.'
        },
        {
            title: 'Customer Success Manager',
            department: 'Customer Success',
            location: 'Remote',
            type: 'Full-time',
            description: 'Help farmers succeed with our platform and build lasting relationships.'
        },
        {
            title: 'Marketing Manager',
            department: 'Marketing',
            location: 'Remote / Hybrid',
            type: 'Full-time',
            description: 'Drive growth through content marketing, partnerships, and community building.'
        }
    ];

    const benefits = [
        { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health, dental, and vision insurance' },
        { icon: Zap, title: 'Flexible Work', description: 'Remote-first culture with flexible hours' },
        { icon: TrendingUp, title: 'Growth', description: 'Professional development and learning budget' },
        { icon: Users, title: 'Great Team', description: 'Work with passionate, talented people' }
    ];

    const values = [
        { title: 'Impact First', description: 'We measure success by the positive impact we create for farmers' },
        { title: 'Innovation', description: 'We embrace new technologies and creative solutions' },
        { title: 'Collaboration', description: 'We believe the best ideas come from working together' },
        { title: 'Sustainability', description: 'We build for the long term, for people and planet' }
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
                            <Briefcase className="text-emerald-600" size={20} />
                            <span className="text-emerald-700 font-semibold text-sm">Join Our Team</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            Build the Future of
                            <span className="block text-emerald-600 mt-2">Agriculture with Us</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Join a mission-driven team using technology to empower farmers and create sustainable food systems worldwide.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
                        <p className="text-lg text-slate-600">What drives us every day</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg transition-all"
                            >
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                                <p className="text-slate-600 text-sm">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Benefits & Perks</h2>
                        <p className="text-lg text-slate-600">We take care of our team</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <benefit.icon className="text-emerald-600" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                                <p className="text-slate-600 text-sm">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-20 px-6 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Open Positions</h2>
                        <p className="text-lg text-slate-600">Find your next opportunity</p>
                    </motion.div>

                    <div className="space-y-4">
                        {openPositions.map((position, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="p-6 rounded-2xl bg-white border-2 border-slate-100 hover:border-emerald-500 hover:shadow-xl transition-all group cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                            {position.title}
                                        </h3>
                                        <p className="text-slate-600 mb-4">{position.description}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Briefcase size={16} />
                                                {position.department}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin size={16} />
                                                {position.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={16} />
                                                {position.type}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                                        Apply Now
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
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
                            Don't See the Right Role?
                        </h2>
                        <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                            We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
                        </p>
                        <button className="px-8 py-4 bg-white text-emerald-600 rounded-full font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                            Send General Application
                        </button>
                    </motion.div>
                </div>
            </section>

            <ModernFooter />
        </div>
    );
};

export default Careers;
