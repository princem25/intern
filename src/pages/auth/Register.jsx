import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('intern'); // 'intern' or 'lead'

    const handleRegister = (e) => {
        e.preventDefault();
        // Mock registration logic
        if (role === 'intern') {
            navigate('/intern/dashboard');
        } else if (role === 'lead') {
            navigate('/lead/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-body)' }}>
            <div className="card p-8 shadow-lg" style={{ width: '100%', maxWidth: '500px' }}>
                <div className="text-center" style={{ marginBottom: '2rem' }}>
                    <Link to="/" className="logo" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}>InternAI</Link>
                    <p className="text-muted">Create your account</p>
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
                        <input type="email" className="input-field" placeholder="john@example.com" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input type="password" className="input-field" placeholder="••••••••" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Confirm Password</label>
                            <input type="password" className="input-field" placeholder="••••••••" required />
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div id="dynamic-fields" className="mb-4">
                        <div className="input-group">
                            <label className="input-label">Technology Track</label>
                            <select className="input-field" name="technology_id">
                                <option value="1">PHP</option>
                                <option value="2">Laravel</option>
                                <option value="3">Java</option>
                                <option value="4">AI</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', padding: '0.875rem' }}>Create Account</button>
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
