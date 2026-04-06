import React from 'react';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <PublicLayout>
            {/* Hero Section */}
            <header className="hero" style={{ background: 'var(--gradient-hero)', padding: '5rem 0' }}>
                <div className="container text-center">
                    <h1 style={{ color: 'var(--primary)', fontSize: '3.5rem', marginBottom: '1.5rem' }}>Managing Internships Made Intelligent</h1>
                    <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>Streamline your internship program with AI-driven performance tracking, code reviews, and structured learning paths.</p>
                    <div className="flex justify-center gap-4">
                        <Link to="/auth/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Get Started</Link>
                        <a href="#features" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>Learn More</a>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="section" style={{ padding: '5rem 0' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '4rem' }}>
                        <h2>Key Features</h2>
                        <p className="text-muted">Everything you need to manage successful internship programs.</p>
                    </div>

                    <div className="grid grid-responsive gap-8">
                        {/* Feature 1 */}
                        <div className="card p-6 text-center">
                            <div style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                                <i className="fa-solid fa-code"></i>
                            </div>
                            <h3>Code Review Sandbox</h3>
                            <p className="text-muted">Integrated coding environment for interns to submit solutions and receive structured feedback.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card p-6 text-center">
                            <div style={{ fontSize: '2.5rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                                <i className="fa-solid fa-chart-line"></i>
                            </div>
                            <h3>Performance Analytics</h3>
                            <p className="text-muted">Real-time dashboards for HR and Team Leads to track progress and identify top performers.</p>
                        </div>

                        {/* Feature 3 */}
                         
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default Landing;
