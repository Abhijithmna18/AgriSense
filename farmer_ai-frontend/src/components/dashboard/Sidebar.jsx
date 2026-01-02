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
    Building,
    Activity,
    MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import recommendationIcon from '../../assets/recommendations_custom.png';
import '../../styles/admin.css';

const Sidebar = ({ onLogout }) => {
    const [expandedMenu, setExpandedMenu] = React.useState(null);

    const toggleMenu = (label) => {
        setExpandedMenu(expandedMenu === label ? null : label);
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
        { icon: TrendingUp, label: 'Forecasting', path: '/forecasting' },
        { icon: BrainCircuit, label: 'AI Models', path: '/ai-models' },
        { icon: Activity, label: 'Farm Monitoring', path: '/monitoring' },
        { icon: null, img: recommendationIcon, label: 'Recommendations', path: '/recommendations' },
        {
            icon: Building,
            label: 'Warehouses',
            // path: '/warehouses', // Removed direct path
            children: [
                { label: 'Browse Warehouses', path: '/warehouses' },
                { label: 'My Bookings', path: '/my-bookings' }
            ]
        },
        { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
        { icon: LinkIcon, label: 'Blockchain', path: '/blockchain' },
        { icon: MessageSquare, label: 'Feedback', path: '/feedback', badge: 'New' }, // Icon will be handled in render
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-[var(--admin-border)] z-40 hidden md:flex flex-col overflow-hidden box-border bg-[var(--admin-bg-secondary)]">
            {/* Logo Area */}
            <div className="p-8 border-b border-[var(--admin-border)] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--admin-bg-hover)] text-[var(--admin-accent)] rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-serif font-bold">A</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-serif font-bold tracking-wide text-[var(--admin-text-primary)]">AgriSense</h1>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--admin-text-secondary)]">Agri Ecosystem</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
                {navItems.map((item) => (
                    <div key={item.label}>
                        {item.children ? (
                            // Dropdown Parent
                            <div className="space-y-1">
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`
                                        relative flex items-center justify-between gap-4 px-4 py-3 rounded-lg transition-all duration-300 group w-full box-border border-l-2 cursor-pointer
                                        ${expandedMenu === item.label
                                            ? 'bg-[var(--admin-bg-hover)] text-[var(--admin-accent)] border-[var(--admin-accent)]'
                                            : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-text-primary)] border-transparent'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <item.icon size={20} />
                                        <span className="font-medium tracking-wide truncate">{item.label}</span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: expandedMenu === item.label ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </motion.div>
                                </button>

                                {/* Submenu */}
                                <motion.div
                                    initial={false}
                                    animate={{ height: expandedMenu === item.label ? 'auto' : 0, opacity: expandedMenu === item.label ? 1 : 0 }}
                                    className="overflow-hidden pl-12 space-y-1"
                                >
                                    {item.children.map(child => (
                                        <NavLink
                                            key={child.path}
                                            to={child.path}
                                            className={({ isActive }) => `
                                                block py-2 text-sm transition-colors
                                                ${isActive ? 'text-[var(--admin-accent)] font-medium' : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]'}
                                            `}
                                        >
                                            {child.label}
                                        </NavLink>
                                    ))}
                                </motion.div>
                            </div>
                        ) : (
                            // Standard Link
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                                    relative flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 group w-full box-border border-l-2
                                    ${isActive
                                        ? 'bg-[var(--admin-bg-hover)] text-[var(--admin-accent)] border-[var(--admin-accent)]'
                                        : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-text-primary)] border-transparent'
                                    }
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {item.img ? (
                                            <img
                                                src={item.img}
                                                alt={item.label}
                                                className={`w-6 h-6 object-contain transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100 grayscale'}`}
                                            />
                                        ) : (
                                            <item.icon
                                                size={20}
                                                className={`transition-colors duration-300 ${isActive ? 'text-[var(--admin-accent)]' : 'group-hover:text-[var(--admin-accent)]'}`}
                                            />
                                        )}
                                        <span className="font-medium tracking-wide truncate">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
