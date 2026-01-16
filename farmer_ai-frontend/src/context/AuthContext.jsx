import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/authApi';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeRole, setActiveRole] = useState(null);

    // Check auth on load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await authAPI.getMe();
                // Handle different response structures:
                // 1. response.data.data (some APIs wrap in data field)
                // 2. response.data.user (login endpoint returns { user: ... })
                // 3. response.data (getMe/userController returns direct user object)
                const userData = response.data.data || response.data.user || response.data;

                setUser(userData);
                setIsAuthenticated(true);
                setActiveRole(userData.activeRole || userData.role || (userData.roles ? userData.roles[0] : null));
            } catch (error) {
                console.error("Auth check failed:", error);
                localStorage.removeItem('auth_token');
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);
        const { token, user } = response.data;

        localStorage.setItem('auth_token', token);
        setUser(user);
        setIsAuthenticated(true);
        setActiveRole(user.activeRole || (user.roles && user.roles[0]) || 'farmer'); // Default to farmer if undefined

        return user;
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error("Logout error", error);
        }
        localStorage.removeItem('auth_token');
        setUser(null);
        setIsAuthenticated(false);
        setActiveRole(null);
        window.location.href = '/login';
    };

    const register = async (data) => {
        return await authAPI.register(data);
    };

    const switchRole = async (role) => {
        try {
            const response = await authAPI.switchRole({ role });
            const updatedUser = response.data.user;

            setUser(updatedUser);
            setActiveRole(updatedUser.activeRole);
            return true;
        } catch (error) {
            console.error("Switch role failed", error);
            throw error;
        }
    };

    const addRole = async (role) => {
        try {
            const response = await authAPI.addRole({ role });
            const updatedUser = response.data.user;

            setUser(updatedUser);
            setActiveRole(updatedUser.activeRole);
            return true;
        } catch (error) {
            console.error("Add role failed", error);
            throw error;
        }
    };

    const refreshProfile = async () => {
        try {
            const response = await authAPI.getMe();
            const userData = response.data.data || response.data.user || response.data;
            setUser(userData);
            setActiveRole(userData.activeRole || userData.role || (userData.roles ? userData.roles[0] : null));
            return userData;
        } catch (error) {
            console.error("Refresh profile failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            activeRole,
            login,
            logout,
            register,
            switchRole,
            addRole,
            refreshProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
