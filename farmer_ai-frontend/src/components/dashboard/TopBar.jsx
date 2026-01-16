import React, { useState } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, User, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const TopBar = ({ user, onLogout }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { switchRole, activeRole } = useAuth();
    const navigate = useNavigate();
    const [switching, setSwitching] = useState(false);

    const handleRoleSwitch = async () => {
        setSwitching(true);
        try {
            const newRole = activeRole === 'farmer' ? 'vendor' : 'farmer';
            await switchRole(newRole);

            // Navigate based on new role
            if (newRole === 'vendor') {
                navigate('/vendor-dashboard');
            } else {
                navigate('/farmer-dashboard');
            }
        } catch (error) {
            console.error("Failed to switch role", error);
        } finally {
            setSwitching(false);
        }
    };

    const canSwitch = user && (
        (user.roles && user.roles.includes('vendor')) ||
        user.role === 'vendor' ||
        user.vendorProfile?.status === 'approved'
    );

    return (
        <header className="sticky top-0 z-30 px-8 py-4 border-b border-[var(--admin-border)] flex items-center justify-between bg-[var(--admin-bg-secondary)]">
            {/* Left: Mobile Menu Trigger (Hidden on Desktop) & Subtitle */}
            <div className="flex items-center gap-4">
                <div className="md:hidden">
                    {/* Mobile Menu Trigger Placeholder */}
                    <div className="w-8 h-8 bg-[var(--admin-bg-hover)] rounded-lg"></div>
                </div>
                <h2 className="text-lg font-serif font-medium hidden md:block text-[var(--admin-text-primary)]">
                    AgriSense Ecosystem Platform
                </h2>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-xl mx-8 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] group-focus-within:text-[var(--admin-accent)] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search farms, crops, or reports..."
                        className="w-full pl-12 pr-4 py-3 rounded-full bg-[var(--admin-bg-primary)] border border-[var(--admin-border)] focus:border-[var(--admin-accent)] focus:bg-[var(--admin-bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/20 transition-all duration-300 placeholder:text-[var(--admin-text-muted)] text-[var(--admin-text-primary)]"
                    />
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">

                {/* Role Switcher */}
                {canSwitch && (
                    <button
                        onClick={handleRoleSwitch}
                        disabled={switching}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors border border-indigo-200"
                    >
                        <RefreshCw size={14} className={switching ? "animate-spin" : ""} />
                        {activeRole === 'farmer' ? 'Switch to Vendor' : 'Switch to Farmer'}
                    </button>
                )}

                {/* Notifications */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors rounded-full hover:bg-[var(--admin-bg-hover)]">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--admin-bg-secondary)]"></span>
                    </button>
                    <button className="p-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors rounded-full hover:bg-[var(--admin-bg-hover)]">
                        <MessageSquare size={20} />
                    </button>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-[var(--admin-border)]"></div>

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 group focus:outline-none"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium transition-colors text-[var(--admin-text-primary)]">
                                Hello, {user?.firstName || 'User'}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-[var(--admin-text-secondary)]">
                                {activeRole || user?.role || 'Farmer'}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--admin-bg-primary)] p-0.5 ring-2 ring-transparent group-hover:ring-[var(--admin-accent)] transition-all">
                            <div className="w-full h-full rounded-full bg-[var(--admin-bg-secondary)] flex items-center justify-center overflow-hidden border border-[var(--admin-border)]">
                                {user?.profilePhotoUrl ? (
                                    <img src={user.profilePhotoUrl} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-[var(--admin-text-muted)]" />
                                )}
                            </div>
                        </div>
                        <ChevronDown size={16} className="text-[var(--admin-text-secondary)] transition-transform duration-300" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-4 w-56 bg-[var(--admin-bg-secondary)] rounded-xl shadow-lg border border-[var(--admin-border)] overflow-hidden py-2"
                            >
                                <div className="px-4 py-3 border-b border-[var(--admin-border)] md:hidden">
                                    <p className="text-sm font-medium text-[var(--admin-text-primary)]">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-[var(--admin-text-muted)]">{user?.email}</p>
                                </div>
                                <a href="/profile-settings" className="block px-4 py-2 text-sm text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-accent)] transition-colors">
                                    Profile Settings
                                </a>
                                {canSwitch && (
                                    <button
                                        onClick={handleRoleSwitch}
                                        className="w-full text-left px-4 py-2 text-sm text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-accent)] transition-colors md:hidden"
                                    >
                                        {activeRole === 'farmer' ? 'Switch to Vendor' : 'Switch to Farmer'}
                                    </button>
                                )}
                                <a href="#billing" className="block px-4 py-2 text-sm text-[var(--admin-text-primary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-accent)] transition-colors">
                                    Billing & Plans
                                </a>
                                <div className="h-px bg-[var(--admin-border)] my-2"></div>
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-[var(--admin-danger)] hover:bg-red-50 transition-colors"
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
