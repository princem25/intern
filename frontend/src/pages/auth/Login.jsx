import React, { useState } from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link, useNavigate } from 'react-router-dom';

import { login } from '../../api/auth';

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const data = await login(email, password);
            // Assuming data.user contains role
            if (data.user.status === 'pending') {
                setError('Your account is pending approval.');
                // Should logout or clear session if token was set?
                // The backend should not return token if pending, but our code handled it.
                // Actually backend Login returns 403 if pending.
            } else {
                // Redirect based on role
                const role = data.user.role?.name; // role object loaded
                if (role === 'teamlead' || role === 'admin') {
                    navigate('/lead/dashboard');
                } else if (role === 'hr') {
                    navigate('/hr/dashboard');
                } else {
                    navigate('/intern/dashboard');
                }
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
            <div className="card p-8 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="text-center mb-8">
                    <Link to="/" className="text-primary" style={{ fontSize: '2rem', fontWeight: 800 }}>InternAI</Link>
                    <h2 className="mt-4">Welcome Back</h2>
                    <p className="text-muted">Sign in to your account</p>
                    {error && <div className="alert alert-danger mt-3" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input type="email" name="email" className="input-field" placeholder="john@example.com" style={{ paddingLeft: '2.5rem' }} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input type="password" name="password" className="input-field" placeholder="••••••••" style={{ paddingLeft: '2.5rem' }} required />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" />
                            <span className="text-sm text-muted">Remember me</span>
                        </label>
                        <Link to="/auth/forgot-password" className="text-sm text-primary font-medium">Forgot password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
                </form>

                <div className="text-center text-sm text-muted">
                    Don't have an account? <Link to="/auth/register" className="text-primary font-medium">Create account</Link>
                </div>

            </div>
        </div>
    );
};

export default Login;
