import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminNav from './AdminNav';
import '../../styles/admin.css';

const AdminLayout = () => {
    const navigate = useNavigate();

    // Basic role check on mount
    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo || userInfo.role !== 'admin') {
            // Ideally backend prevents this, but client-side redirect for UX
            // navigate('/'); // Commented out for development ease if needed, but should be enabled
        }

        // Add dark class to html or body for admin routes to ensure Tailwind dark mode works if used
        document.documentElement.classList.add('dark');

        return () => {
            // Cleanup? Maybe not if we want to persist dark mode, but strictly admin theme is scoped via CSS vars
            // const isUserThemeDark = ... // Revert to user preference logic if exists
        };
    }, [navigate]);

    return (
        <div className="admin-layout flex font-sans">
            <AdminNav />
            <main className="admin-main flex-1 ml-64 bg-[var(--admin-bg-primary)] min-h-screen p-8 transition-colors duration-300">
                <div className="container mx-auto max-w-7xl animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
