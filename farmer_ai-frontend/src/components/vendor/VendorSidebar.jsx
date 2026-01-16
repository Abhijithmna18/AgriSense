import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Star,
    BarChart3,
    Wallet,
    Bell,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VendorSidebar = ({ isCollapsed, toggleSidebar }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/vendor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/vendor/products', icon: Package, label: 'My Products' },
        { path: '/vendor/orders', icon: ShoppingCart, label: 'Order History' },
        { path: '/vendor/reviews', icon: Star, label: 'Product Reviews' },
        { path: '/vendor/analytics', icon: BarChart3, label: 'Sales Analytics' },
        { path: '/vendor/payments', icon: Wallet, label: 'Payment History' },
        { path: '/vendor/notifications', icon: Bell, label: 'Notifications' },
        { path: '/vendor/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div
            className={`bg-white h-screen border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                } fixed left-0 top-0 z-30`}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                {!isCollapsed && (
                    <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                        <Store size={24} />
                        <span>VendorHub</span>
                    </div>
                )}
                {isCollapsed && <Store className="mx-auto text-green-700" size={24} />}

                <button
                    onClick={toggleSidebar}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hidden md:block"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                            ${isActive
                                ? 'bg-green-50 text-green-700 font-medium shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }
                        `}
                        title={isCollapsed ? item.label : ''}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} className={isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors
                        ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title="Logout"
                >
                    <LogOut size={22} />
                    {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default VendorSidebar;
