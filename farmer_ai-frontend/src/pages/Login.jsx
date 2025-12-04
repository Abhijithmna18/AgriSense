import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { authAPI } from '../services/authApi';
import AuthHeader from '../components/auth/AuthHeader';
import AuthForm from '../components/auth/AuthForm';
import PasswordInput from '../components/auth/PasswordInput';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                navigate('/dashboard');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMsg);

            if (err.response?.data?.needsVerification) {
                setError(`${errorMsg} Would you like to verify now?`);
            }
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
            setError("Google Sign-In failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const footerLink = (
        <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-green hover:text-light-green font-semibold transition-colors">
                Register
            </Link>
        </p>
    );

    return (
        <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest transition-colors">
            <AuthHeader />
            <div className="pt-20">
                <AuthForm
                    title="Welcome Back"
                    subtitle="Login to your AgriSense account"
                    onSubmit={handleSubmit}
                    error={error}
                    loading={loading}
                    submitText="Login"
                    footer={footerLink}
                >
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
                                className="w-full pl-12 pr-4 py-3 rounded-full border border-primary-green/30 bg-white/50 dark:bg-deep-forest/50 text-dark-green-text dark:text-warm-ivory focus:outline-none focus:border-primary-green transition-colors"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <PasswordInput
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-primary-green hover:text-light-green transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

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

export default Login;
