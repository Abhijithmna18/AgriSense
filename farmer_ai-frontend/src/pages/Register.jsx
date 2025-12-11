import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/authApi';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { validatePassword } from '../utils/passwordValidation';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '' });

    useEffect(() => {
        if (formData.password) {
            const { score } = validatePassword(formData.password);
            const labels = ['Weak', 'Fair', 'Good', 'Strong'];
            setPasswordStrength({ score, label: labels[Math.min(score, 3)] });
        } else {
            setPasswordStrength({ score: 0, label: '' });
        }

        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
        } else if (formData.confirmPassword) {
            setErrors(prev => { const { confirmPassword, ...rest } = prev; return rest; });
        }
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => { const { [name]: removed, ...rest } = prev; return rest; });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = "Required";
        if (!formData.lastName.trim()) newErrors.lastName = "Required";
        if (!formData.email.trim()) newErrors.email = "Required";
        const passValidation = validatePassword(formData.password);
        if (!passValidation.isValid) newErrors.password = passValidation.errors[0];
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await authAPI.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });
            if (response.data.success) {
                navigate(`/verify?email=${encodeURIComponent(formData.email)}`);
            }
        } catch (err) {
            setGeneralError(err.response?.data?.message || 'Registration failed.');
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
                navigate('/dashboard');
            }
        } catch (error) {
            setGeneralError("Google Sign-Up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-premium-green'];

    return (
        <AuthLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-deep-charcoal tracking-tight">Create your account</h1>
                    <p className="text-deep-charcoal/70 mt-2">Start your journey with AgriSense.</p>
                </div>

                {/* Error Banner */}
                {generalError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 mb-6">
                        <AlertCircle size={20} />
                        <span className="font-medium text-sm">{generalError}</span>
                    </div>
                )}

                {/* Google Sign-Up (Primary CTA) */}
                <GoogleSignInButton onClick={handleGoogleSignIn} disabled={loading} text="Sign up with Google" />

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-deep-charcoal/20"></div>
                    <span className="px-4 text-sm text-deep-charcoal/50 font-medium">or register with email</span>
                    <div className="flex-1 border-t border-deep-charcoal/20"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-deep-charcoal mb-2">First Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-charcoal/40" />
                                <input
                                    type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${errors.firstName ? 'border-red-300' : 'border-deep-charcoal/20'} bg-white text-deep-charcoal placeholder-deep-charcoal/40 focus:outline-none focus:ring-2 focus:ring-premium-green focus:border-transparent`}
                                    placeholder="John"
                                />
                            </div>
                            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-deep-charcoal mb-2">Last Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-charcoal/40" />
                                <input
                                    type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${errors.lastName ? 'border-red-300' : 'border-deep-charcoal/20'} bg-white text-deep-charcoal placeholder-deep-charcoal/40 focus:outline-none focus:ring-2 focus:ring-premium-green focus:border-transparent`}
                                    placeholder="Doe"
                                />
                            </div>
                            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-deep-charcoal mb-2">Email Address</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-charcoal/40" />
                            <input
                                type="email" name="email" value={formData.email} onChange={handleChange}
                                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-300' : 'border-deep-charcoal/20'} bg-white text-deep-charcoal placeholder-deep-charcoal/40 focus:outline-none focus:ring-2 focus:ring-premium-green focus:border-transparent`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-semibold text-deep-charcoal mb-2">Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-charcoal/40" />
                            <input
                                type="password" name="password" value={formData.password} onChange={handleChange}
                                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-300' : 'border-deep-charcoal/20'} bg-white text-deep-charcoal placeholder-deep-charcoal/40 focus:outline-none focus:ring-2 focus:ring-premium-green focus:border-transparent`}
                                placeholder="Create a strong password"
                            />
                        </div>
                        {/* Strength Meter */}
                        {formData.password && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex gap-1 flex-1">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className={`h-1 flex-1 rounded-full ${i < passwordStrength.score ? strengthColors[passwordStrength.score - 1] : 'bg-deep-charcoal/20'}`}></div>
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-deep-charcoal/60">{passwordStrength.label}</span>
                            </div>
                        )}
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-deep-charcoal mb-2">Confirm Password</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-charcoal/40" />
                            <input
                                type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${errors.confirmPassword ? 'border-red-300' : 'border-deep-charcoal/20'} bg-white text-deep-charcoal placeholder-deep-charcoal/40 focus:outline-none focus:ring-2 focus:ring-premium-green focus:border-transparent`}
                                placeholder="Confirm your password"
                            />
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <Check size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-premium-green" />
                            )}
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-deep-charcoal/60 text-center">
                        By signing up, you agree to our <a href="#" className="text-premium-green hover:underline">Terms</a> and <a href="#" className="text-premium-green hover:underline">Privacy Policy</a>.
                    </p>

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
                            'Create Account'
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <p className="text-center text-deep-charcoal/70 mt-8 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-premium-green hover:text-dark-accent-green font-semibold transition-colors">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </AuthLayout>
    );
};

export default Register;
