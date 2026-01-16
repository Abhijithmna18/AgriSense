import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import MarketplaceSidebar from './MarketplaceSidebar';
import TopBar from '../dashboard/TopBar'; // Reusing TopBar for consistency
import { useAuth } from '../../context/AuthContext';

const MarketplaceLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { user, logout } = useAuth();

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <MarketplaceSidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
            />

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'ml-20' : 'ml-64'
                    }`}
            >
                {/* Top Navigation */}
                <TopBar user={user} logout={logout} />

                {/* Page Content */}
                <main className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MarketplaceLayout;
