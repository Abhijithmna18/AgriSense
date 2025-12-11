import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/authApi';
import '../styles/auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Check email format first
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setError('Please enter a valid email address.');
                setLoading(false);
                return;
            }

            await authAPI.forgotPassword({ email });
            // Always show success generic message
            setSuccess(true);
        } catch (err) {
            console.error('Forgot password error:', err);
            // Even on error, we might want to be vague, but if it's a server error/rate limit we can show it
            if (err.response && err.response.status === 429) {
                setError('Too many requests. Please try again later.');
            } else {
                // Fallback to success message to avoid enumeration if it's a 404 disguised
                // But if it's a real 500, show generic error
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2 className="auth-title">Forgot Password?</h2>
                    <p className="auth-subtitle">
                        Enter your email address and we'll send you a code to reset your password.
                    </p>
                </div>

                {success ? (
                    <div className="auth-alert auth-alert-success" role="alert">
                        <span>
                            If that email address is in our database, we will send you an email to reset your password.
                        </span>
                    </div>
                ) : (
                    error && (
                        <div className="auth-alert auth-alert-error" role="alert">
                            <span>{error}</span>
                        </div>
                    )
                )}

                {!success && (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-input-group">
                            <label htmlFor="email" className="auth-label">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button type="submit" className="auth-button" disabled={loading || !email}>
                            {loading ? <div className="spinner"></div> : 'Send Reset Code'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        Remember your password? <Link to="/login" className="auth-link">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
