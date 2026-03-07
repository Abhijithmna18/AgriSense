import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (to be created)
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import Bills from './pages/Bills';
import Savings from './pages/Savings';
import FixedDeposits from './pages/FixedDeposits';
import Cards from './pages/Cards';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
                <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
                <Route path="/fixed-deposits" element={<ProtectedRoute><FixedDeposits /></ProtectedRoute>} />
                <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
            <Toaster position="top-right" />
        </AuthProvider>
    );
}

export default App;
