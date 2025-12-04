import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    BrainCircuit,
    DollarSign,
    FileText,
    Truck,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSidebar = ({ isCollapsed, onToggle }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Farm Management', path: '/admin/farms' },
        { icon: ShoppingCart, label: 'Marketplace [B2B/B2C]', path: '/admin/marketplace' },
        { icon: BrainCircuit, label: 'AI Advisory', path: '/admin/ai-advisory' },
        { icon: DollarSign, label: 'Financials', path: '/admin/financials' },
        { icon: FileText, label: 'Gov Schemes', path: '/admin/schemes' },
        { icon: Truck, label: 'Logistics', path: '/admin/logistics' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <motion.aside
            initial={{ width: 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className="fixed left-0 top-0 h-screen admin-glass border-r border-cyber-green/20 z-50 flex flex-col"
            style={{ background: 'var(--admin-bg-secondary)' }}
        >
            {/* Logo Area */}
            <div className="p-6 border-b border-cyber-green/10 flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-cyber-green to-cyber-green-bright rounded-lg flex items-center justify-center neon-glow">
                                <span className="text-xl font-bold text-admin-bg-primary">A</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold cyber-text">AgriSense</h1>
                                <p className="text-[10px] text-cyber-green/60 uppercase tracking-widest">Admin Console</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={onToggle}
                    className="p-2 hover:bg-cyber-green/10 rounded-lg transition-colors text-cyber-green"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                            ${isActive
                                ? 'bg-cyber-green/20 text-cyber-green shadow-lg'
                                : 'text-gray-400 hover:text-cyber-green hover:bg-white/5'
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeAdminNav"
                                        className="absolute left-0 w-1 h-8 bg-cyber-green rounded-r-full neon-glow"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                <item.icon
                                    size={20}
                                    className={`transition-colors duration-300 ${isActive ? 'text-cyber-green' : 'group-hover:text-cyber-green'}`}
                                />
                                <AnimatePresence mode="wait">
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="font-medium tracking-wide text-sm"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-cyber-green/10">
                <div className="text-center">
                    <p className="text-[10px] text-gray-500">© 2024 AgriSense Admin</p>
                </div>
            </div>
        </motion.aside>
    );
};

export default AdminSidebar;
