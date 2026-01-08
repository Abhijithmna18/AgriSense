import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Check, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../services/authApi';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import ValidatedInput from '../components/auth/ValidatedInput';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { validatePassword } from '../utils/passwordValidation';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
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

        // Validate cleaned phone number (same as what backend receives)
        const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
        if (!formData.phone.trim()) {
            newErrors.phone = "Required";
        } else if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            newErrors.phone = "Phone number must be 10-15 digits";
        } else if (!/^\+?\d{10,15}$/.test(cleanPhone)) {
            newErrors.phone = "Phone number can only contain digits and optional + prefix";
        }

        const passValidation = validatePassword(formData.password);
        if (!passValidation.isValid) newErrors.password = passValidation.errors[0];
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const { register } = useAuth();
    const [roles, setRoles] = useState(['farmer']); // Default to farmer

    // ... (handleChange existing)

    const toggleRole = (role) => {
        setRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        if (!validateForm()) return;

        if (roles.length === 0) {
            setGeneralError("Please select at least one role.");
            return;
        }

        setLoading(true);
        try {
            // Sanitize phone (remove spaces, dashes, parentheses)
            const cleanPhone = formData.phone.replace(/[^\d+]/g, '');

            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: cleanPhone,
                password: formData.password,
                roles: roles
            });
            navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
        } catch (err) {
            console.error("Registration Error:", err);
            let errorMessage = 'Registration failed.';

            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                // Handle express-validator errors array
                errorMessage = err.response.data.errors.map(e => e.msg).join('. ');
            } else if (err.response?.data?.message) {
                // Handle standard message
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setGeneralError(errorMessage);
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
            setGeneralError("Google Sign-Up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-[#2E7D32]'];

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
                        <ValidatedInput
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            label="First Name"
                            icon={User}
                            placeholder="John"
                            validationType="text"
                            error={errors.firstName}
                            required
                        />
                        <ValidatedInput
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            label="Last Name"
                            icon={User}
                            placeholder="Doe"
                            validationType="text"
                            error={errors.lastName}
                            required
                        />
                    </div>

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
                        error={errors.email}
                        required
                    />

                    {/* Phone Number */}
                    <ValidatedInput
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        label="Phone Number"
                        icon={Phone}
                        placeholder="1234567890"
                        validationType="phone"
                        error={errors.phone}
                        required
                    />

                    {/* Password */}
                    <div>
                        <ValidatedInput
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            label="Password"
                            icon={Lock}
                            placeholder="Create a strong password"
                            validationType="password"
                            error={errors.password}
                            required
                        />
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
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <ValidatedInput
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            label="Confirm Password"
                            icon={Lock}
                            placeholder="Confirm your password"
                            validationType="password"
                            error={errors.confirmPassword}
                            required
                        />
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <Check size={18} className="absolute right-4 top-[46px] text-[#2E7D32]" />
                        )}
                    </div>

                    {/* Terms */}
                    <p className="text-xs text-deep-charcoal/60 text-center">
                        By signing up, you agree to our <a href="#" className="text-[#2E7D32] hover:underline">Terms</a> and <a href="#" className="text-[#2E7D32] hover:underline">Privacy Policy</a>.
                    </p>

                    {/* Role Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-deep-charcoal">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['farmer', 'buyer'].map((role) => (
                                <div
                                    key={role}
                                    onClick={() => toggleRole(role)}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${roles.includes(role)
                                        ? 'border-[#2E7D32] bg-[#2E7D32]/5'
                                        : 'border-gray-200 hover:border-[#2E7D32]/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${roles.includes(role) ? 'border-[#2E7D32] bg-[#2E7D32]' : 'border-gray-300'
                                            }`}>
                                            {roles.includes(role) && <Check size={12} className="text-white" />}
                                        </div>
                                        <span className="capitalize font-medium text-deep-charcoal">{role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-deep-charcoal/60">You can select both and switch anytime.</p>
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
                            'Create Account'
                        )}
                    </motion.button>
                </form>

                {/* Footer */}
                <p className="text-center text-deep-charcoal/70 mt-8 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#2E7D32] hover:text-[#1B5E20] font-semibold transition-colors">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </AuthLayout>
    );
};

export default Register;
