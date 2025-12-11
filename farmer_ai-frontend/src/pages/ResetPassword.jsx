import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/authApi';
import OTPInput from '../components/OTPInput';
import '../styles/auth.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) setEmail(emailParam);

        const codeParam = searchParams.get('code');
        if (codeParam) setCode(codeParam);
    }, [searchParams]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleResend = async () => {
        if (resendCooldown > 0 || !email) return;

        try {
            await authAPI.resendReset({ email });
            setSuccessMessage('Code resent successfully. Please check your email.');
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (code.length !== 6) {
            setError('Please enter the 6-digit code.');
            return;
        }

        setLoading(true);

        try {
            await authAPI.verifyReset({ email, code, newPassword });
            setSuccessMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Reset Password</h2>
                    <p className="auth-subtitle">
                        Enter the code sent to your email and your new password.
                    </p>
                </div>

                {error && (
                    <div className="auth-alert auth-alert-error" role="alert">
                        <span>{error}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="auth-alert auth-alert-success" role="alert">
                        <span>{successMessage}</span>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label htmlFor="email" className="auth-label">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={!!searchParams.get('email')} // Readonly if passed via URL
                        />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Verification Code (6-digits)</label>
                        <OTPInput
                            value={code}
                            onChange={setCode}
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-input-group">
                        <label htmlFor="newPassword" className="auth-label">New Password</label>
                        <input
                            id="newPassword"
                            type="password"
                            className="auth-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            placeholder="Min. 8 characters"
                            disabled={loading}
                        />
                    </div>

                    <div className="auth-input-group">
                        <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="auth-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Re-enter password"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? <div className="spinner"></div> : 'Reset Password'}
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendCooldown > 0 || loading}
                            style={{ background: 'none', border: 'none', color: '#124D35', cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}
                        >
                            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                    </div>

                </form>

                <div className="auth-footer">
                    <p>
                        <Link to="/login" className="auth-link">Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
