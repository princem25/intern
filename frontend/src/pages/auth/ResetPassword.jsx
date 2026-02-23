import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    const [email, setEmail] = useState(emailParam || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const data = await resetPassword(token, email, password, confirmPassword);
            setMessage(data.status || 'Password changed successfully.');
            setTimeout(() => navigate('/auth/login'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
            <div className="card p-8 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="text-center mb-8">
                    <Link to="/" className="text-primary" style={{ fontSize: '2rem', fontWeight: 800 }}>InternAI</Link>
                    <h2 className="mt-4">New Password</h2>
                    <p className="text-muted">Enter your new password below</p>
                    {message && <div className="alert alert-success mt-3" style={{ color: 'green', marginTop: '1rem' }}>{message}</div>}
                    {error && <div className="alert alert-danger mt-3" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
                </div>

                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="token" value={token || ''} />

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input
                                type="email"
                                className="input-field"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={!!emailParam}
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">New Password</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingLeft: '2.5rem' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                style={{ paddingLeft: '2.5rem' }}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
