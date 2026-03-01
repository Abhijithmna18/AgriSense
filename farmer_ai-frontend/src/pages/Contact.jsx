import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import ModernNavbar from '../components/ModernNavbar';
import ModernFooter from '../components/ModernFooter';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const contactInfo = [
        {
            icon: Mail,
            title: 'Email Us',
            details: 'support@agrisense.com',
            subdetails: 'We reply within 24 hours',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: Phone,
            title: 'Call Us',
            details: '+1 (555) 123-4567',
            subdetails: 'Mon-Fri, 9AM-6PM PST',
            color: 'from-emerald-500 to-emerald-600'
        },
        {
            icon: MapPin,
            title: 'Visit Us',
            details: '123 Farm Tech Plaza',
            subdetails: 'San Francisco, CA 94105',
            color: 'from-purple-500 to-purple-600'
        }
    ];

    const faqs = [
        {
            question: 'How quickly can I get started?',
            answer: 'You can sign up and start using AgriSense immediately. Our onboarding process takes less than 5 minutes.'
        },
        {
            question: 'Do you offer training?',
            answer: 'Yes! We provide comprehensive training materials, video tutorials, and live onboarding sessions for all new users.'
        },
        {
            question: 'What kind of support do you provide?',
            answer: 'We offer 24/7 email support, live chat during business hours, and dedicated account managers for enterprise customers.'
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
                            <MessageSquare className="text-emerald-600" size={20} />
                            <span className="text-emerald-700 font-semibold text-sm">Get in Touch</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                            We'd Love to
                            <span className="block text-emerald-600 mt-2">Hear from You</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Have questions? Need support? Want to partner with us? Our team is here to help.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-6">
                        {contactInfo.map((info, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all text-center group"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <info.icon className="text-white" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{info.title}</h3>
                                <p className="text-lg text-emerald-600 font-semibold mb-1">{info.details}</p>
                                <p className="text-sm text-slate-500">{info.subdetails}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section className="pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-8 md:p-10 rounded-3xl shadow-xl"
                        >
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
                            
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="text-emerald-600" size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                                    <p className="text-slate-600">We'll get back to you within 24 hours.</p>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        Send Message
                                        <Send size={20} />
                                    </button>
                                </form>
                            )}
                        </motion.div>

                        {/* FAQs & Office Hours */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            {/* Office Hours */}
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-3xl text-white shadow-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <Clock size={32} />
                                    <h3 className="text-2xl font-bold">Office Hours</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span className="font-semibold">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span className="font-semibold">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span className="font-semibold">Closed</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-emerald-500">
                                    <p className="text-emerald-100 text-sm">
                                        All times are in Pacific Standard Time (PST)
                                    </p>
                                </div>
                            </div>

                            {/* Quick FAQs */}
                            <div className="bg-white p-8 rounded-3xl shadow-xl">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Answers</h3>
                                <div className="space-y-4">
                                    {faqs.map((faq, index) => (
                                        <div key={index} className="pb-4 border-b border-slate-100 last:border-0">
                                            <h4 className="font-bold text-slate-900 mb-2">{faq.question}</h4>
                                            <p className="text-slate-600 text-sm">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <ModernFooter />
        </div>
    );
};

export default Contact;
