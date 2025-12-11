import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sprout, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModernNavbar = () => {
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

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Data Insights', href: '#data' },
        { name: 'Marketplace', href: '#marketplace' },
        { name: 'About', href: '#about' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('/')}
                >
                    <div className="w-10 h-10 bg-muted-green rounded-xl flex items-center justify-center shadow-lg shadow-muted-green/20 group-hover:scale-105 transition-transform">
                        <Sprout size={24} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-slate-800' : 'text-slate-800'} transition-colors`}>
                        AgriSense
                    </span>
                </div>

                {/* Desktop Nav & Actions */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-slate-500 hover:text-muted-green font-medium transition-colors text-xs uppercase tracking-widest"
                        >
                            {link.name}
                        </a>
                    ))}
                    <a
                        href="/login"
                        className="px-6 py-2.5 bg-muted-green text-white rounded-full font-semibold shadow-md shadow-muted-green/20 hover:bg-emerald-700 hover:shadow-lg transition-all text-sm"
                    >
                        Log In
                    </a>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-slate-700"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
                    >
                        <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-slate-600 font-medium py-2 border-b border-slate-50"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex flex-col gap-3 mt-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 text-slate-600 font-semibold border border-slate-200 rounded-lg"
                                >
                                    Log In
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default ModernNavbar;
