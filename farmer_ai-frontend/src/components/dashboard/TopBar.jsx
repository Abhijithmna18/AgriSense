import React, { useState } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopBar = ({ user, onLogout }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-30 px-8 py-4 glass border-b border-accent-gold/10 flex items-center justify-between">
            {/* Left: Mobile Menu Trigger (Hidden on Desktop) & Subtitle */}
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    {/* Mobile Menu Trigger Placeholder */}
                    <div className="w-8 h-8 bg-primary-green/20 rounded-lg"></div>
                </div>
                <h2 className="text-lg font-serif font-medium text-dark-green-text dark:text-warm-ivory hidden md:block">
                    AgriSense Ecosystem Platform
                </h2>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-green-text/40 group-focus-within:text-accent-gold transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search farms, crops, or reports..."
                        className="w-full pl-12 pr-4 py-3 rounded-full bg-white/50 dark:bg-black/20 border border-transparent focus:border-accent-gold/50 focus:bg-white dark:focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-accent-gold/20 transition-all duration-300 placeholder:text-dark-green-text/30"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">
                {/* Notifications */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-dark-green-text/60 hover:text-accent-gold transition-colors rounded-full hover:bg-primary-green/5">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-warm-ivory dark:border-deep-forest"></span>
                    </button>
                    <button className="p-2 text-dark-green-text/60 hover:text-accent-gold transition-colors rounded-full hover:bg-primary-green/5">
                        <MessageSquare size={20} />
                    </button>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-dark-green-text/10"></div>

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 group focus:outline-none"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-dark-green-text dark:text-warm-ivory group-hover:text-accent-gold transition-colors">
                                Hello, {user?.firstName || 'User'}
                            </p>
                            <p className="text-[10px] text-dark-green-text/50 uppercase tracking-wider">
                                {user?.role || 'Farmer'}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-green to-light-green p-0.5 ring-2 ring-transparent group-hover:ring-accent-gold transition-all">
                            <div className="w-full h-full rounded-full bg-deep-forest flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-warm-ivory" />
                                )}
                            </div>
                        </div>
                        <ChevronDown size={16} className={`text-dark-green-text/50 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-4 w-56 glass rounded-xl shadow-gold overflow-hidden py-2"
                            >
                                <div className="px-4 py-3 border-b border-accent-gold/10 md:hidden">
                                    <p className="text-sm font-medium text-dark-green-text dark:text-warm-ivory">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-dark-green-text/50">{user?.email}</p>
                                </div>
                                <a href="#profile" className="block px-4 py-2 text-sm text-dark-green-text/80 hover:bg-primary-green/10 hover:text-accent-gold transition-colors">
                                    Profile Settings
                                </a>
                                <a href="#billing" className="block px-4 py-2 text-sm text-dark-green-text/80 hover:bg-primary-green/10 hover:text-accent-gold transition-colors">
                                    Billing & Plans
                                </a>
                                <div className="h-px bg-accent-gold/10 my-2"></div>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
