import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../services/authApi';

const PrivateRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        verifyAuth();
    }, []);

    const verifyAuth = async () => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            // Verify token by calling protected endpoint
            await authAPI.getMe();
            setIsAuthenticated(true);
        } catch (error) {
            // Token invalid or expired
            localStorage.removeItem('auth_token');
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-dark-green-text dark:text-warm-ivory">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
