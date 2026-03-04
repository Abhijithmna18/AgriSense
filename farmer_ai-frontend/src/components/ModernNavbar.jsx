import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sprout, User, ChevronDown } from 'lucide-react';

const ModernNavbar = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिंदी' },
        { code: 'ta', name: 'தமிழ்' },
        { code: 'kn', name: 'ಕನ್ನಡ' },
        { code: 'te', name: 'తెలుగు' },
        { code: 'ml', name: 'മലയാളം' }
    ];

    const changeLanguage = (lngCode) => {
        i18n.changeLanguage(lngCode);
        setIsLangMenuOpen(false);
        setIsMobileMenuOpen(false); // Close mobile menu if open
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('topbar.features', 'Features'), href: '#features', isAnchor: true },
        { name: t('topbar.data_insights', 'Data Insights'), href: '#data', isAnchor: true },
        { name: t('sidebar.marketplace', 'Marketplace'), href: '#marketplace', isAnchor: true },
        { name: t('topbar.about', 'About'), href: '/about', isAnchor: false },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-slate-200/50 py-3'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate('/')}
                    >
                        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${isScrolled
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30'
                            : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/40'
                            }`}>
                            <Sprout size={24} className="text-white" strokeWidth={2.5} />
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-2xl font-bold tracking-tight transition-colors ${isScrolled ? 'text-slate-900' : 'text-slate-900'
                                }`}>
                                AgriSense
                            </span>
                            <span className="text-xs text-emerald-600 font-semibold -mt-1">Smart Farming</span>
                        </div>
                    </motion.div>

                    {/* Desktop Nav & Actions */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navLinks.map((link, index) => (
                            link.isAnchor ? (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative px-4 py-2 font-medium transition-all duration-300 text-sm group ${isScrolled
                                        ? 'text-slate-600 hover:text-emerald-600'
                                        : 'text-slate-700 hover:text-emerald-600'
                                        }`}
                                >
                                    {link.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:w-full transition-all duration-300"></span>
                                </motion.a>
                            ) : (
                                <motion.button
                                    key={link.name}
                                    onClick={() => navigate(link.href)}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`relative px-4 py-2 font-medium transition-all duration-300 text-sm group ${isScrolled
                                        ? 'text-slate-600 hover:text-emerald-600'
                                        : 'text-slate-700 hover:text-emerald-600'
                                        }`}
                                >
                                    {link.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 group-hover:w-full transition-all duration-300"></span>
                                </motion.button>
                            )
                        ))}

                        {/* Divider */}
                        <div className="w-px h-6 bg-slate-300 mx-2"></div>

                        {/* Language Switcher */}
                        <div className="relative">
                            <motion.button
                                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-lg ${isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-800 hover:bg-white/50'
                                    }`}
                            >
                                {languages.find(lang => lang.code === i18n.language)?.name || 'English'}
                                <ChevronDown size={14} className={`transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                            </motion.button>

                            <AnimatePresence>
                                {isLangMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden"
                                    >
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => changeLanguage(lang.code)}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${i18n.language === lang.code
                                                    ? 'bg-emerald-50 text-emerald-600 font-medium'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                                                    }`}
                                            >
                                                {lang.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Auth Buttons */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                            className="px-5 py-2.5 text-slate-700 hover:text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all text-sm"
                        >
                            Sign In
                        </motion.button>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all text-sm"
                        >
                            Get Started
                        </motion.button>
                    </div>

                    {/* Mobile Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className={`lg:hidden p-2 rounded-xl transition-colors ${isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-800 hover:bg-white/50'
                            }`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl overflow-hidden"
                    >
                        <div className="container mx-auto px-6 py-6">
                            {/* Mobile Nav Links */}
                            <div className="space-y-1 mb-6">
                                {/* Mobile Language Switcher */}
                                <div className="mb-4 bg-slate-50 p-2 rounded-xl grid grid-cols-2 gap-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang.code)}
                                            className={`py-2 px-3 rounded-lg text-sm text-center transition-colors ${i18n.language === lang.code
                                                ? 'bg-emerald-100 text-emerald-700 font-medium shadow-sm'
                                                : 'text-slate-600 hover:bg-emerald-50'
                                                }`}
                                        >
                                            {lang.name}
                                        </button>
                                    ))}
                                </div>

                                {navLinks.map((link, index) => (
                                    link.isAnchor ? (
                                        <motion.a
                                            key={link.name}
                                            href={link.href}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="block px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {link.name}
                                        </motion.a>
                                    ) : (
                                        <motion.button
                                            key={link.name}
                                            onClick={() => {
                                                navigate(link.href);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="w-full text-left px-4 py-3 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl font-medium transition-all"
                                        >
                                            {link.name}
                                        </motion.button>
                                    )
                                ))}
                            </div>

                            {/* Mobile Auth Buttons */}
                            <div className="space-y-3 pt-6 border-t border-slate-200">
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    onClick={() => {
                                        navigate('/login');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full py-3 text-slate-700 font-semibold border-2 border-slate-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all"
                                >
                                    Sign In
                                </motion.button>
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    onClick={() => {
                                        navigate('/register');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30"
                                >
                                    Get Started Free
                                </motion.button>
                            </div>

                            {/* Mobile Footer Info */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="mt-6 pt-6 border-t border-slate-200 text-center"
                            >
                                <p className="text-sm text-slate-500">
                                    Join <span className="font-bold text-emerald-600">10,000+</span> farmers
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default ModernNavbar;
