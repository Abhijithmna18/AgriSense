import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export const LuxuryFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-b from-[#0B231E] to-[#1A1A1A] pt-20 pb-8 border-t border-[#D4AF37]/20">
            <div className="container mx-auto px-6">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h3
                            className="text-2xl font-bold text-[#D4AF37] mb-4"
                            style={{ fontFamily: 'var(--font-serif)' }}
                        >
                            FarmerAI
                        </h3>
                        <p className="text-[#F9F8F4]/70 mb-6 leading-relaxed font-light">
                            Empowering agriculture through intelligent technology and sustainable innovation.
                        </p>

                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {[
                                { Icon: Facebook, href: '#' },
                                { Icon: Twitter, href: '#' },
                                { Icon: Instagram, href: '#' },
                                { Icon: Linkedin, href: '#' },
                            ].map(({ Icon, href }, index) => (
                                <motion.a
                                    key={index}
                                    href={href}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 rounded-full glass flex items-center justify-center text-[#F9F8F4] hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all"
                                >
                                    <Icon size={18} strokeWidth={1.5} />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h4 className="text-lg font-semibold text-[#F9F8F4] mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {['About Us', 'Features', 'Pricing', 'Blog', 'Careers'].map((link, index) => (
                                <li key={index}>
                                    <a
                                        href="#"
                                        className="text-[#F9F8F4]/70 hover:text-[#D4AF37] transition-colors font-light inline-flex items-center gap-2 group"
                                    >
                                        <span className="w-0 h-px bg-[#D4AF37] group-hover:w-4 transition-all duration-300"></span>
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Solutions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h4 className="text-lg font-semibold text-[#F9F8F4] mb-4">Solutions</h4>
                        <ul className="space-y-3">
                            {['AI Disease Detection', 'Yield Forecasting', 'Blockchain Traceability', 'Smart Irrigation', 'Market Analytics'].map((solution, index) => (
                                <li key={index}>
                                    <a
                                        href="#"
                                        className="text-[#F9F8F4]/70 hover:text-[#D4AF37] transition-colors font-light inline-flex items-center gap-2 group"
                                    >
                                        <span className="w-0 h-px bg-[#D4AF37] group-hover:w-4 transition-all duration-300"></span>
                                        {solution}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h4 className="text-lg font-semibold text-[#F9F8F4] mb-4">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-[#F9F8F4]/70 font-light">
                                <Mail size={18} className="text-[#D4AF37] mt-1 flex-shrink-0" strokeWidth={1.5} />
                                <span>contact@farmerai.com</span>
                            </li>
                            <li className="flex items-start gap-3 text-[#F9F8F4]/70 font-light">
                                <Phone size={18} className="text-[#D4AF37] mt-1 flex-shrink-0" strokeWidth={1.5} />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-3 text-[#F9F8F4]/70 font-light">
                                <MapPin size={18} className="text-[#D4AF37] mt-1 flex-shrink-0" strokeWidth={1.5} />
                                <span>123 Agriculture Ave<br />Farm Valley, CA 94016</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                {/* Newsletter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="glass rounded-2xl p-8 mb-12"
                >
                    <div className="max-w-2xl mx-auto text-center">
                        <h4
                            className="text-2xl font-semibold text-[#F9F8F4] mb-3"
                            style={{ fontFamily: 'var(--font-serif)' }}
                        >
                            Stay Updated
                        </h4>
                        <p className="text-[#F9F8F4]/70 mb-6 font-light">
                            Subscribe to our newsletter for the latest insights and updates
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-6 py-3 bg-[#1A1A1A] border border-[#D4AF37]/30 rounded-full text-[#F9F8F4] placeholder-[#F9F8F4]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-3 bg-[#D4AF37] text-[#0B231E] rounded-full font-semibold hover:bg-[#F4D03F] transition-colors"
                            >
                                Subscribe
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-[#D4AF37]/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[#F9F8F4]/50 text-sm font-light">
                            © {currentYear} FarmerAI. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="text-[#F9F8F4]/50 hover:text-[#D4AF37] text-sm font-light transition-colors"
                                >
                                    {link}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
