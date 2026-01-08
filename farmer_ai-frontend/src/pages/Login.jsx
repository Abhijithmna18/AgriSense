import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import ValidatedInput from '../components/auth/ValidatedInput';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(formData);
            console.log('Login successful. User:', user);
            console.log('Active Role:', user.activeRole);
            console.log('Roles:', user.roles);

            // Redirect based on active role
            if (user.roles && user.roles.includes('admin')) {
                navigate('/admin/dashboard');
            } else if (user.activeRole === 'buyer' || (user.roles && user.roles.includes('buyer') && !user.roles.includes('farmer'))) {
                navigate('/buyer-dashboard');
            } else {
                navigate('/farmer-dashboard'); // Default to farmer dashboard
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

                const userData = response.data.user;

                // Prioritize activeRole for navigation
                const activeRole = userData.activeRole || (userData.roles && userData.roles[0]) || userData.role || 'farmer';

                // Redirect based on active role
                if (activeRole === 'admin' || (userData.roles && userData.roles.includes('admin'))) {
                    navigate('/admin/dashboard');
                } else if (activeRole === 'buyer') {
                    navigate('/buyer-dashboard');
                } else {
                    navigate('/farmer-dashboard');
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
                    <ValidatedInput
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        label="Email Address"
                        icon={Mail}
                        placeholder="you@example.com"
                        validationType="email"
                        required
                    />

                    {/* Password */}
                    <ValidatedInput
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        label="Password"
                        icon={Lock}
                        placeholder="Enter your password"
                        validationType="password"
                        required
                    />

                    {/* Forgot Password */}
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-[#2E7D32] hover:text-[#1B5E20] font-medium transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full py-3.5 bg-[#2E7D32] text-white rounded-xl font-semibold shadow-lg shadow-[#2E7D32]/20 hover:bg-[#1B5E20] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <Link to="/register" className="text-[#2E7D32] hover:text-[#1B5E20] font-semibold transition-colors">
                        Create Account
                    </Link>
                </p>
            </motion.div>
        </AuthLayout>
    );
};

export default Login;
