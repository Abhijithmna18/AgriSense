import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, Sprout, ShoppingBag,
    Flag, Shield, Activity, Settings, LogOut
} from 'lucide-react';
import '../../styles/admin.css';

const AdminNav = () => {
    const navItems = [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/farms', icon: Sprout, label: 'Farms' },
        { to: '/admin/marketplace', icon: ShoppingBag, label: 'Marketplace' },
        { to: '/admin/feature-flags', icon: Flag, label: 'Feature Flags' },
        { to: '/admin/roles', icon: Shield, label: 'Roles' },
        { to: '/admin/audit', icon: Activity, label: 'Audit Logs' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <nav className="w-64 bg-[var(--admin-bg-secondary)] border-r border-[var(--admin-border)] flex flex-col h-screen fixed left-0 top-0 z-[var(--z-nav)] transition-colors duration-300">
            <div className="p-6 border-b border-[var(--admin-border)]">
                <h2 className="text-xl font-bold text-[var(--admin-text-primary)] flex items-center gap-3">
                    <div className="text-[var(--admin-accent)] bg-[var(--admin-bg-hover)] p-2 rounded-lg">
                        <Shield size={22} />
                    </div>
                    <span>Agri<span className="text-[var(--admin-text-secondary)]">Sense</span></span>
                </h2>
            </div>

            <div className="flex-1 py-6 overflow-y-auto">
                <ul className="space-y-1 px-4">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium border-l-2
                                    ${isActive
                                        ? 'bg-[var(--admin-bg-hover)] text-[var(--admin-accent)] border-[var(--admin-accent)]'
                                        : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-hover)] hover:text-[var(--admin-text-primary)] border-transparent'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon size={18} className={isActive ? "opacity-100" : "opacity-70"} />
                                        {item.label}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="p-4 border-t border-[var(--admin-border)]">
                <button
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)] hover:bg-[var(--admin-bg-hover)] rounded-lg transition-colors group"
                    onClick={() => {
                        localStorage.removeItem('userInfo');
                        window.location.href = '/login';
                    }}
                >
                    <LogOut size={18} className="group-hover:stroke-[var(--admin-danger)]" />
                    <span>Sign Out</span>
                </button>
            </div>
        </nav>
    );
};

export default AdminNav;
