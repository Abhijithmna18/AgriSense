import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import VendorSidebar from './VendorSidebar';
import TopBar from '../dashboard/TopBar';
import { useAuth } from '../../context/AuthContext';

const VendorLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <VendorSidebar
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                {/* TopBar */}
                <TopBar user={user} onLogout={logout} />

                {/* Page Content */}
                <main className="p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default VendorLayout;
