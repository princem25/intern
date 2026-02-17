import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const InternDashboard = () => {
    return (
        <DashboardLayout role="Intern">
            {/* Row 1: Stats Cards */}
            <div className="grid grid-responsive gap-6 mb-8">
                {/* Card 1 */}
                <Card className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                        <i className="fa-solid fa-book"></i>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>React Hooks</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Assigned Topic</div>
                </Card>

                {/* Card 2 */}
                <Card className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                        <i className="fa-solid fa-bars-progress"></i>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>75%</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Progress</div>
                </Card>

                {/* Card 3 */}
                <Card className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>850</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Score</div>
                </Card>

                {/* Card 4 */}
                {/* Card 4 - Replaced Time Spent with Attendance if possible or remove. Leaving 3 cards for now or using Logic */}
                <Card className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent)' }}>
                        <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>120m</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Extra Hours Approved</div>
                </Card>
            </div>

            {/* Row 2: Current Task Panel */}
            <Card className="p-6 mb-8">
                <div className="flex justify-between items-start gap-6" style={{ flexWrap: 'wrap' }}>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 style={{ margin: 0 }}>Build a To-Do App</h3>
                            <span className="badge badge-warning">In Progress</span>
                        </div>
                        <div className="text-muted" style={{ marginBottom: '1.5rem' }}>
                            <i className="fa-solid fa-calendar" style={{ marginRight: '0.5rem' }}></i> Assigned: Yesterday
                        </div>
                        <Link to="/intern/workspace" style={{ textDecoration: 'none' }}>
                            <Button variant="primary" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                                Start Task <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                            </Button>
                        </Link>
                    </div>
                    {/* Optional illustration */}
                    <div style={{ width: '120px', height: '120px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border)', flexShrink: 0 }}>
                        <i className="fa-solid fa-code" style={{ fontSize: '3rem' }}></i>
                    </div>
                </div>
            </Card>

            {/* Row 3: Recent Feedback */}
            <div>
                <h3 style={{ marginBottom: '1rem' }}>Recent Feedback</h3>
                <div className="overflow-x-auto">
                    <table className="feedback-table">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Score</th>
                                <th>Feedback</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Array Manipulation</td>
                                <td><span className="badge badge-success">90/100</span></td>
                                <td>Good optimization, but variable naming could be better.</td>
                                <td>Oct 24, 2026</td>
                            </tr>
                            <tr>
                                <td>Flexbox Layout</td>
                                <td><span className="badge badge-warning">75/100</span></td>
                                <td>Missed responsiveness on mobile screens.</td>
                                <td>Oct 23, 2026</td>
                            </tr>
                            <tr>
                                <td>API Fetching</td>
                                <td><span className="badge badge-success">95/100</span></td>
                                <td>Excellent error handling implementation.</td>
                                <td>Oct 21, 2026</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InternDashboard;
