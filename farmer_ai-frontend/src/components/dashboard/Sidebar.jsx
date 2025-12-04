import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart2,
    TrendingUp,
    BrainCircuit,
    ShoppingBag,
    Link as LinkIcon,
    Settings,
    LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ onLogout }) => {
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
        { icon: TrendingUp, label: 'Forecasting', path: '/forecasting' },
        { icon: BrainCircuit, label: 'AI Models', path: '/ai-models' },
        { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
        { icon: LinkIcon, label: 'Blockchain', path: '/blockchain' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-deep-forest text-warm-ivory border-r border-accent-gold/20 z-40 hidden md:flex flex-col">
            {/* Logo Area */}
            <div className="p-8 border-b border-accent-gold/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-green to-accent-gold rounded-lg flex items-center justify-center shadow-gold">
                        <span className="text-2xl font-serif font-bold text-white">A</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-bold tracking-wide">AgriSense</h1>
                        <p className="text-[10px] text-accent-gold uppercase tracking-widest">Agri Ecosystem</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                            ${isActive
                                ? 'bg-primary-green/20 text-accent-gold shadow-lg'
                                : 'text-warm-ivory/60 hover:text-warm-ivory hover:bg-white/5'
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 w-1 h-8 bg-accent-gold rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                <item.icon
                                    size={20}
                                    className={`transition-colors duration-300 ${isActive ? 'text-accent-gold' : 'group-hover:text-accent-gold'}`}
                                />
                                <span className="font-medium tracking-wide">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-accent-gold/10">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group"
                >
                    <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Logout</span>
                </button>
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-warm-ivory/30">© 2024 AgriSense Inc.</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
