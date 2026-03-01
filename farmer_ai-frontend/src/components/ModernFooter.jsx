import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Sprout, 
    Twitter, 
    Facebook, 
    Instagram, 
    Linkedin, 
    Youtube, 
    Mail, 
    Phone, 
    MapPin,
    Send,
    ArrowRight,
    Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModernFooter = ({ config }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const defaultConfig = {
        branding: {
            logo: '',
            companyName: 'AgriSense',
            mission: 'Empowering farmers with artificial intelligence for a sustainable and productive future.'
        },
        socialMedia: [
            { platform: 'twitter', url: '#' },
            { platform: 'facebook', url: '#' },
            { platform: 'instagram', url: '#' },
            { platform: 'linkedin', url: '#' }
        ],
        navigationColumns: [
            {
                title: 'Platform',
                links: [
                    { label: 'Features', url: '/#features' },
                    { label: 'Marketplace', url: '/marketplace' },
                    { label: 'AI Advisory', url: '/advisories' },
                    { label: 'Sell on AgriSense', url: '/sell' },
                    { label: 'Pricing', url: '#' }
                ]
            },
            {
                title: 'Resources',
                links: [
                    { label: 'Crop Knowledge', url: '/crop-knowledge' },
                    { label: 'Weather Intelligence', url: '/weather-intelligence' },
                    { label: 'Pest Prediction', url: '/pest-prediction' },
                    { label: 'Community Forum', url: '/community' },
                    { label: 'Help Center', url: '#' }
                ]
            },
            {
                title: 'Company',
                links: [
                    { label: 'About Us', url: '/about' },
                    { label: 'Careers', url: '/careers' },
                    { label: 'Blog', url: '/blog' },
                    { label: 'Contact', url: '/contact' },
                    { label: 'Partners', url: '/partners' }
                ]
            }
        ],
        newsletter: {
            heading: 'Stay Updated',
            subtext: 'Get the latest agricultural insights and platform updates.',
            placeholder: 'Enter your email'
        },
        legal: {
            copyright: `© ${new Date().getFullYear()} AgriSense. All rights reserved.`,
            privacyPolicyUrl: '/privacy',
            termsOfServiceUrl: '/terms',
            showRegionSelector: false
        }
    };

    const footerConfig = config?.footer || defaultConfig;
    const { branding, socialMedia, navigationColumns, newsletter, legal } = footerConfig;

    const getSocialIcon = (platform) => {
        const icons = {
            twitter: Twitter,
            facebook: Facebook,
            instagram: Instagram,
            linkedin: Linkedin,
            youtube: Youtube
        };
        return icons[platform] || Twitter;
    };

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setTimeout(() => {
                setSubscribed(false);
                setEmail('');
            }, 3000);
        }
    };

    const handleNavigation = (url) => {
        // Skip if url is empty or just '#'
        if (!url || url === '#') {
            return;
        }
        
        // Check if it's a hash link on the home page
        if (url.startsWith('/#')) {
            const hash = url.substring(2); // Remove '/#'
            if (!hash) return; // Skip if no hash after '/#'
            
            navigate('/');
            setTimeout(() => {
                const element = document.querySelector(`#${hash}`);
                element?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } 
        // Check if it's a hash link on current page
        else if (url.startsWith('#')) {
            const hash = url.substring(1); // Remove '#'
            if (!hash) return; // Skip if no hash after '#'
            
            const element = document.querySelector(`#${hash}`);
            element?.scrollIntoView({ behavior: 'smooth' });
        } 
        // Regular navigation to other pages
        else {
            navigate(url);
            // Scroll to top of new page
            window.scrollTo(0, 0);
        }
    };

    return (
        <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
            </div>

            <div className="relative container mx-auto px-6 pt-20 pb-10">
                {/* Main Footer Content */}
                <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Brand Section - Larger */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                {branding?.logo ? (
                                    <img src={branding.logo} alt={branding.companyName || 'Logo'} className="h-10" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <Sprout size={24} className="text-white" strokeWidth={2.5} />
                                        </div>
                                        <span className="text-2xl font-bold tracking-tight">
                                            {branding?.companyName || defaultConfig.branding.companyName}
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-slate-300 leading-relaxed mb-8 text-sm">
                                {branding?.mission || defaultConfig.branding.mission}
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <Mail size={16} className="text-emerald-400" />
                                    <span>support@agrisense.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <Phone size={16} className="text-emerald-400" />
                                    <span>+1 (555) 123-4567</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <MapPin size={16} className="text-emerald-400" />
                                    <span>San Francisco, CA</span>
                                </div>
                            </div>

                            {/* Social Media */}
                            <div className="flex gap-3">
                                {(socialMedia || defaultConfig.socialMedia).map((social, i) => {
                                    const Icon = getSocialIcon(social.platform);
                                    return (
                                        <motion.a
                                            key={i}
                                            href={social.url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.1, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="w-10 h-10 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all duration-300"
                                        >
                                            <Icon size={18} />
                                        </motion.a>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* Navigation Columns */}
                    {(navigationColumns || defaultConfig.navigationColumns).map((column, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="lg:col-span-2"
                        >
                            <h4 className="font-bold text-lg mb-6 text-white">{column.title}</h4>
                            <ul className="space-y-3">
                                {column.links?.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <button
                                            onClick={() => handleNavigation(link.url || '#')}
                                            className="text-slate-300 hover:text-emerald-400 transition-colors text-sm flex items-center gap-2 group"
                                        >
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}

                    {/* Newsletter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-4"
                    >
                        <h4 className="font-bold text-lg mb-4 text-white">
                            {newsletter?.heading || defaultConfig.newsletter.heading}
                        </h4>
                        <p className="text-slate-300 mb-6 text-sm">
                            {newsletter?.subtext || defaultConfig.newsletter.subtext}
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={newsletter?.placeholder || defaultConfig.newsletter.placeholder}
                                    className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center justify-center transition-colors"
                                >
                                    <Send size={16} className="text-white" />
                                </button>
                            </div>
                            {subscribed && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-emerald-400 text-sm flex items-center gap-2"
                                >
                                    <Heart size={14} fill="currentColor" />
                                    Thanks for subscribing!
                                </motion.p>
                            )}
                        </form>

                        {/* Trust Badges */}
                        <div className="mt-8 pt-8 border-t border-slate-700">
                            <p className="text-slate-400 text-xs mb-3">Trusted by farmers worldwide</p>
                            <div className="flex gap-4 items-center">
                                <div className="px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-300">
                                    🔒 Secure
                                </div>
                                <div className="px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-300">
                                    ✓ Verified
                                </div>
                                <div className="px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700 text-xs text-slate-300">
                                    ⭐ 4.9/5
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-700/50 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-slate-400 text-sm">
                            {legal?.copyright?.replace('{year}', new Date().getFullYear()) || defaultConfig.legal.copyright}
                        </p>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <button
                                onClick={() => navigate(legal?.privacyPolicyUrl || defaultConfig.legal.privacyPolicyUrl)}
                                className="text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                                Privacy Policy
                            </button>
                            <button
                                onClick={() => navigate(legal?.termsOfServiceUrl || defaultConfig.legal.termsOfServiceUrl)}
                                className="text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                                Terms of Service
                            </button>
                            <button className="text-slate-400 hover:text-emerald-400 transition-colors">
                                Cookie Policy
                            </button>
                            {legal?.showRegionSelector && (
                                <button className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
                                    🌐 Region
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-slate-500 text-xs">
                            Made with <Heart size={12} className="inline text-emerald-500" fill="currentColor" /> for farmers everywhere
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default ModernFooter;
