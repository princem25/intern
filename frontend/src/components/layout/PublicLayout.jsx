import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export const PublicLayout = ({ children }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            {/* Navbar */}
            <nav className="navbar">
                <div className="container nav-container">
                    <Link to="/" className="logo">InternAI</Link>
                    <div className="nav-links">
                        {/* Links... */}
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#about" className="nav-link">About</a>
                        <a href="#contact" className="nav-link">Contact</a>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={toggleTheme}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem', minWidth: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
                        </button>
                        <Link to="/auth/login" className="btn btn-secondary">Login</Link>
                        <Link to="/auth/register" className="btn btn-primary">Register</Link>
                    </div>
                </div>
            </nav>

            {children}

            {/* Footer */}
            <footer style={{ background: 'var(--bg-card)', padding: '3rem 0', borderTop: '1px solid var(--border)' }}>
                <div className="container text-center">
                    <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>InternAI</h3>
                    <div className="flex justify-center gap-6 mb-8 text-muted">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Support</a>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>&copy; 2026 InternAI Systems. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
};
