import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { register } from '../../api/auth';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('intern'); // 'intern' or 'lead'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [technologies, setTechnologies] = useState([]);

    useEffect(() => {
        // Fetch technologies from API
        const fetchTechnologies = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/technologies`);
                if (response.ok) {
                    const data = await response.json();
                    setTechnologies(data);
                }
            } catch (err) {
                console.error('Failed to fetch technologies:', err);
            }
        };

        fetchTechnologies();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        const form = e.target;
        const password = form.password.value;
        const confirmPassword = form.confirm_password.value;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const roleId = role === 'lead' ? 2 : 1; // 1: intern, 2: teamlead

        const userData = {
            name: form.name.value,
            email: form.email.value,
            password: password,
            password_confirmation: confirmPassword,
            role_id: roleId,
            technology_id: form.technology_id ? form.technology_id.value : null,
        };

        try {
            const data = await register(userData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/auth/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Registration failed.');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
            <div className="card p-8 shadow-lg" style={{ width: '100%', maxWidth: '500px' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <Link to="/" className="logo" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}>InternAI</Link>
                    <p className="text-muted">Create your account</p>
                    {error && <div className="alert alert-danger mt-3" style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
                    {success && <div className="alert alert-success mt-3" style={{ color: 'green', marginTop: '1rem' }}>Registration successful! Redirecting...</div>}
                </div>

                {/* Role Selection */}
                <label className="input-label" style={{ marginBottom: '0.75rem' }}>Select your role</label>
                <div className="role-grid">
                    <div
                        className={`role-card ${role === 'intern' ? 'active' : ''}`}
                        onClick={() => setRole('intern')}
                    >
                        <div className="role-icon"><i className="fa-solid fa-user-graduate"></i></div>
                        <div className="role-title">Intern</div>
                    </div>
                    <div
                        className={`role-card ${role === 'lead' ? 'active' : ''}`}
                        onClick={() => setRole('lead')}
                    >
                        <div className="role-icon"><i className="fa-solid fa-chalkboard-user"></i></div>
                        <div className="role-title">Team Lead</div>
                    </div>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input type="text" className="input-field" placeholder="John Doe" name="name" required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input type="email" className="input-field" placeholder="john@example.com" name="email" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input type="password" className="input-field" placeholder="••••••••" name="password" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Confirm Password</label>
                            <input type="password" className="input-field" placeholder="••••••••" name="confirm_password" required />
                        </div>
                    </div>

                    <div id="dynamic-fields" className="mb-4">
                        <div className="input-group">
                            <label className="input-label">Technology Track</label>
                            <select className="input-field" name="technology_id">
                                <option value="">Select a technology</option>
                                {technologies.map((tech) => (
                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', padding: '0.875rem' }} disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
                </form>

                <div className="text-center" style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
