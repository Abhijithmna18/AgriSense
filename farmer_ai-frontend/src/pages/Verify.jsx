import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { authAPI } from '../services/authApi';
import { Header } from '../components/Header';

const Verify = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!email) {
            setError('Email is required. Please register first.');
        }
    }, [email]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authAPI.verifyEmail({ email, otp });

            if (response.data.success) {
                // Save token
                localStorage.setItem('auth_token', response.data.token);
                setSuccess('Email verified successfully! Redirecting...');

                // Redirect to dashboard
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccess('');
        setResending(true);

        try {
            const response = await authAPI.resendOtp({ email });

            if (response.data.success) {
                setSuccess('OTP resent successfully! Check your email.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-ivory dark:bg-deep-forest transition-colors">
            <Header />

            <div className="container mx-auto px-6 pt-32 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-green to-light-green rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail size={32} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-dark-green-text dark:text-warm-ivory mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                            Verify Your Email
                        </h1>
                        <p className="text-dark-green-text/70 dark:text-warm-ivory/70">
                            Enter the 6-digit code sent to
                        </p>
                        <p className="text-primary-green font-semibold mt-1">{email}</p>
                    </div>

                    {/* Form */}
                    <div className="glass rounded-3xl p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                                <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleVerify} className="space-y-5">
                            {/* OTP Input */}
                            <div>
                                <label className="block text-sm font-medium text-dark-green-text dark:text-warm-ivory mb-2">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                    className="w-full px-4 py-3 bg-white/50 dark:bg-deep-forest/50 border border-primary-green/30 rounded-full text-dark-green-text dark:text-warm-ivory text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-primary-green transition-colors"
                                    placeholder="000000"
                                />
                                <p className="mt-2 text-xs text-center text-dark-green-text/60 dark:text-warm-ivory/60">
                                    Code expires in 10 minutes
                                </p>
                            </div>

                            {/* Verify Button */}
                            <motion.button
                                type="submit"
                                disabled={loading || otp.length !== 6}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 bg-gradient-to-r from-primary-green to-light-green text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </motion.button>
                        </form>

                        {/* Resend OTP */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-dark-green-text/70 dark:text-warm-ivory/70 mb-3">
                                Didn't receive the code?
                            </p>
                            <motion.button
                                onClick={handleResend}
                                disabled={resending}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-2 text-primary-green hover:text-light-green font-semibold disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
                                {resending ? 'Resending...' : 'Resend Code'}
                            </motion.button>
                        </div>

                        {/* Back to Register */}
                        <div className="mt-6 pt-6 border-t border-primary-green/20 text-center">
                            <Link to="/register" className="text-sm text-dark-green-text/70 dark:text-warm-ivory/70 hover:text-primary-green">
                                ← Back to Register
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Verify;
