import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/authApi';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await authAPI.login(formData);
            if (response.data.success) {
                localStorage.setItem('auth_token', response.data.token);

                // Redirect based on role
                if (response.data.user?.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const response = await authAPI.googleLogin(idToken);
            if (response.data.success) {
                localStorage.setItem('auth_token', response.data.token);

                // Redirect based on role
                if (response.data.user?.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            setError("Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-deep-charcoal tracking-tight">Welcome back</h1>
                    <p className="text-deep-charcoal/70 mt-2">Sign in to continue to your dashboard.</p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
                        <AlertCircle size={20} />
                        <span className="font-medium text-sm">{error}</span>
                    </div>
                )}

                {/* Google Sign-In (Primary CTA) */}
                <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} text="Sign in with Google" />

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-deep-charcoal/20"></div>
                    <span className="px-4 text-sm text-deep-charcoal/50 font-medium">or continue with email</span>
                    <div className="flex-1 border-t border-deep-charcoal/20"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-deep-charcoal mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-charcoal/40" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-deep-charcoal/20 bg-white text-deep-charcoal placeholder-deep-charcoal/40 focus:outline-none focus:ring-2 focus:ring-premium-green focus:border-transparent transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-deep-charcoal mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-charcoal/40" />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-deep-charcoal/20 bg-white text-deep-charcoal placeholder-deep-charcoal/40 focus:outline-none focus:ring-2 focus:ring-premium-green focus:border-transparent transition-all"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-premium-green hover:text-dark-accent-green font-medium transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full py-3.5 bg-dark-accent-green text-white rounded-xl font-semibold shadow-lg shadow-dark-accent-green/20 hover:bg-premium-green transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <p className="text-center text-deep-charcoal/70 mt-8 text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-premium-green hover:text-dark-accent-green font-semibold transition-colors">
                        Create Account
                    </Link>
                </p>
            </motion.div>
        </AuthLayout>
    );
};

export default Login;
