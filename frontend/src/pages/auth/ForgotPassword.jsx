import React, { useState } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const data = await forgotPassword(email);
            setMessage(data.status || 'Password reset link sent to your email.');
        } catch (err) {
            setError(err.message || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
            <div className="card p-8 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="text-center mb-8">
                    <Link to="/" className="text-primary" style={{ fontSize: '2rem', fontWeight: 800 }}>InternAI</Link>
                    <h2 className="mt-4">Reset Password</h2>
                    <p className="text-muted">Enter your email to receive a reset link</p>
                    {message && <div className="alert alert-success mt-3" style={{ color: 'green', marginTop: '1rem' }}>{message}</div>}
                    {error && <div className="alert alert-danger mt-3" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="john@example.com"
                                style={{ paddingLeft: '2.5rem' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="text-center text-sm text-muted">
                    Remember your password? <Link to="/auth/login" className="text-primary font-medium">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
