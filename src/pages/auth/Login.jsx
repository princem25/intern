import React from 'react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login - in a real app, you'd replicate the logic from main.js or call an API
        // For now, redirect to Intern Dashboard as default
        navigate('/intern/dashboard');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
            <div className="card p-8 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="text-center mb-8">
                    <Link to="/" className="text-primary" style={{ fontSize: '2rem', fontWeight: 800 }}>InternAI</Link>
                    <h2 className="mt-4">Welcome Back</h2>
                    <p className="text-muted">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input type="email" className="input-field" placeholder="john@example.com" style={{ paddingLeft: '2.5rem' }} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input type="password" className="input-field" placeholder="••••••••" style={{ paddingLeft: '2.5rem' }} required />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" />
                            <span className="text-sm text-muted">Remember me</span>
                        </label>
                        <a href="#" className="text-sm text-primary font-medium">Forgot password?</a>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mb-4">Sign In</button>
                </form>

                <div className="text-center text-sm text-muted">
                    Don't have an account? <Link to="/auth/register" className="text-primary font-medium">Create account</Link>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>Quick Access (Demo)</p>
                    <div className="flex justify-center gap-2">
                        <button onClick={() => navigate('/intern/dashboard')} className="badge badge-success cursor-pointer" style={{ border: '1px solid currentColor', background: 'transparent', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Intern</button>
                        <button onClick={() => navigate('/lead/dashboard')} className="badge badge-warning cursor-pointer" style={{ border: '1px solid currentColor', background: 'transparent', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Team Lead</button>
                        <button onClick={() => navigate('/hr/dashboard')} className="badge badge-danger cursor-pointer" style={{ border: '1px solid currentColor', background: 'transparent', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>HR</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
