import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuItems = [
        { label: 'Features', href: '#features' },
        { label: 'Marketplace', href: '#marketplace' },
        { label: 'AI Tools', href: '#ai-tools' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'glass shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo - Left Side */}
                    <motion.a
                        href="/"
                        className="flex items-center gap-2 group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-green to-light-green rounded-lg flex items-center justify-center shadow-md">
                            <Sprout size={24} className="text-white" strokeWidth={2} />
                        </div>
                        <span
                            className="text-2xl font-bold text-dark-green-text dark:text-warm-ivory"
                            style={{ fontFamily: 'var(--font-serif)' }}
                        >
                            AgriSense
                        </span>
                    </motion.a>

                    {/* Right Side: Menu Items + Login Button */}
                    <div className="hidden lg:flex items-center gap-8">
                        {/* Menu Items */}
                        {menuItems.map((item, index) => (
                            <motion.a
                                key={index}
                                href={item.href}
                                className="text-dark-green-text dark:text-warm-ivory hover:text-primary-green dark:hover:text-light-green transition-colors font-medium relative group"
                                whileHover={{ y: -2 }}
                            >
                                {item.label}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-green dark:bg-light-green group-hover:w-full transition-all duration-300"></span>
                            </motion.a>
                        ))}

                        {/* Login Button */}
                        <motion.button
                            onClick={() => navigate('/login')}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-2.5 bg-gradient-to-r from-primary-green to-light-green text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
                        >
                            Login
                        </motion.button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-dark-green-text dark:text-warm-ivory"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden mt-4 pb-4"
                    >
                        <div className="flex flex-col gap-4">
                            {menuItems.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    className="text-dark-green-text dark:text-warm-ivory hover:text-primary-green dark:hover:text-light-green transition-colors font-medium py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                            <button className="px-6 py-2.5 bg-gradient-to-r from-primary-green to-light-green text-white rounded-full font-semibold shadow-lg w-full">
                                Login
                            </button>
                        </div>
                    </motion.div>
                )}
            </nav>
        </motion.header>
    );
};
