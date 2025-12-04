import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone } from 'lucide-react';
import { authAPI } from '../services/authApi';
import AuthHeader from '../components/auth/AuthHeader';
import AuthForm from '../components/auth/AuthForm';
import PasswordInput from '../components/auth/PasswordInput';
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
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);

    // Real-time validation
    useEffect(() => {
        const newErrors = {};

        // Password match validation
        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Password strength validation (only if password has length)
        if (formData.password) {
            const { isValid, errors: passErrors } = validatePassword(formData.password);
            if (!isValid && formData.password.length > 0) {
                // We don't show all errors here to avoid clutter, just the first one or a generic one
                // The PasswordInput component shows the strength meter
            }
        }

        setErrors(prev => ({ ...prev, ...newErrors }));

        // Clear errors if fixed
        if (formData.password === formData.confirmPassword) {
            setErrors(prev => {
                const { confirmPassword, ...rest } = prev;
                return rest;
            });
        }
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Phone validation - only allow integers
        if (name === 'phone') {
            const cleaned = value.replace(/\D/g, '');
            setFormData({ ...formData, [name]: cleaned });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear specific field error on change
        if (errors[name]) {
            setErrors(prev => {
                const { [name]: removed, ...rest } = prev;
                return rest;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";

        const passValidation = validatePassword(formData.password);
        if (!passValidation.isValid) {
            newErrors.password = passValidation.errors[0]; // Show first error
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const phoneFormatted = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;

            const response = await authAPI.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: phoneFormatted,
                password: formData.password
            });

            if (response.data.success) {
                navigate(`/verify?email=${encodeURIComponent(formData.email)}`);
            }
        } catch (err) {
            setGeneralError(err.response?.data?.message || 'Registration failed. Please try again.');
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
            console.error("Google Sign-In Error:", error);
            setGeneralError("Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const footerLink = (
        <p>
            Already have an account?{' '}
            <Link to="/login" className="text-primary-green hover:text-light-green font-semibold transition-colors">
                Login
            </Link>
        </p>
    );

    return (
        <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest transition-colors">
            <AuthHeader />
            <div className="pt-20">
                {/* Add padding for fixed header */}
                <AuthForm
                    title="Create Account"
                    subtitle="Join AgriSense for intelligent agriculture"
                    onSubmit={handleSubmit}
                    error={generalError}
                    loading={loading}
                    submitText="Create Account"
                    footer={footerLink}
                >
                    <div className="grid grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="firstName" className="text-sm font-medium text-dark-green-text dark:text-warm-ivory flex items-center gap-1">
                                First Name <span className="text-red-600">*</span>
                            </label>
                            <div className="relative">
                                <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-green pointer-events-none" />
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3 rounded-full border ${errors.firstName ? 'border-red-600' : 'border-primary-green/30'} bg-white/50 dark:bg-deep-forest/50 text-dark-green-text dark:text-warm-ivory focus:outline-none focus:border-primary-green transition-colors`}
                                    placeholder="John"
                                    required
                                    aria-invalid={!!errors.firstName}
                                    aria-describedby={errors.firstName ? "firstName-error" : undefined}
                                />
                            </div>
                            {errors.firstName && <span id="firstName-error" className="text-xs text-red-600 pl-2">{errors.firstName}</span>}
                        </div>

                        {/* Last Name */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="lastName" className="text-sm font-medium text-dark-green-text dark:text-warm-ivory flex items-center gap-1">
                                Last Name <span className="text-red-600">*</span>
                            </label>
                            <div className="relative">
                                <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-green pointer-events-none" />
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={`w-full pl-12 pr-4 py-3 rounded-full border ${errors.lastName ? 'border-red-600' : 'border-primary-green/30'} bg-white/50 dark:bg-deep-forest/50 text-dark-green-text dark:text-warm-ivory focus:outline-none focus:border-primary-green transition-colors`}
                                    placeholder="Doe"
                                    required
                                    aria-invalid={!!errors.lastName}
                                    aria-describedby={errors.lastName ? "lastName-error" : undefined}
                                />
                            </div>
                            {errors.lastName && <span id="lastName-error" className="text-xs text-red-600 pl-2">{errors.lastName}</span>}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-dark-green-text dark:text-warm-ivory flex items-center gap-1">
                            Email <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-green pointer-events-none" />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-12 pr-4 py-3 rounded-full border ${errors.email ? 'border-red-600' : 'border-primary-green/30'} bg-white/50 dark:bg-deep-forest/50 text-dark-green-text dark:text-warm-ivory focus:outline-none focus:border-primary-green transition-colors`}
                                placeholder="john@example.com"
                                required
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                            />
                        </div>
                        {errors.email && <span id="email-error" className="text-xs text-red-600 pl-2">{errors.email}</span>}
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="phone" className="text-sm font-medium text-dark-green-text dark:text-warm-ivory flex items-center gap-1">
                            Phone <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <Phone size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-green pointer-events-none" />
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full pl-12 pr-4 py-3 rounded-full border ${errors.phone ? 'border-red-600' : 'border-primary-green/30'} bg-white/50 dark:bg-deep-forest/50 text-dark-green-text dark:text-warm-ivory focus:outline-none focus:border-primary-green transition-colors`}
                                placeholder="919876543210"
                                pattern="[0-9]+"
                                required
                                aria-invalid={!!errors.phone}
                                aria-describedby={errors.phone ? "phone-error" : undefined}
                            />
                        </div>
                        <p className="text-xs text-dark-green-text/60 dark:text-warm-ivory/60 pl-2">
                            Numbers only (e.g., 919876543210)
                        </p>
                        {errors.phone && <span id="phone-error" className="text-xs text-red-600 pl-2">{errors.phone}</span>}
                    </div>

                    {/* Password */}
                    <PasswordInput
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        showStrength={true}
                        required
                    />

                    {/* Confirm Password */}
                    <PasswordInput
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        required
                    />

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-warm-ivory dark:bg-deep-forest text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <GoogleSignInButton onClick={handleGoogleSignIn} />
                </AuthForm>
            </div>
        </div>
    );
};

export default Register;
