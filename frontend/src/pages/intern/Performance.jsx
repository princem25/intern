import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';

const InternPerformance = () => {
    return (
        <DashboardLayout role="Intern">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Performance History</h2>
            </header>

            <div className="grid grid-responsive gap-8">
                {/* Left: Metrics */}
                <div className="flex flex-col gap-6">
                    <Card className="p-6">
                        <h4 style={{ marginBottom: '1rem' }}>Skill Breakdown</h4>

                        <div style={{ marginBottom: '1rem' }}>
                            <div className="flex justify-between mb-1" style={{ fontSize: '0.875rem' }}>
                                <span>Frontend (React/CSS)</span>
                                <span>90%</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '4px' }}>
                                <div style={{ width: '90%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div className="flex justify-between mb-1" style={{ fontSize: '0.875rem' }}>
                                <span>Backend (Node/SQL)</span>
                                <span>75%</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '4px' }}>
                                <div style={{ width: '75%', height: '100%', background: 'var(--secondary)', borderRadius: '4px' }}></div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div className="flex justify-between mb-1" style={{ fontSize: '0.875rem' }}>
                                <span>Algorithms</span>
                                <span>60%</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-body)', borderRadius: '4px' }}>
                                <div style={{ width: '60%', height: '100%', background: 'var(--accent)', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h4 style={{ marginBottom: '1rem' }}>Weekly Activity</h4>
                        <div className="flex items-end justify-between" style={{ height: '150px' }}>
                            <div style={{ width: '10%', height: '40%', background: 'var(--border)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '10%', height: '60%', background: 'var(--border)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '10%', height: '30%', background: 'var(--border)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '10%', height: '80%', background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '10%', height: '50%', background: 'var(--border)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '10%', height: '90%', background: 'var(--border)', borderRadius: '4px 4px 0 0' }}></div>
                            <div style={{ width: '10%', height: '20%', background: 'var(--border)', borderRadius: '4px 4px 0 0' }}></div>
                        </div>
                        <div className="flex justify-between text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                        </div>
                    </Card>
                </div>

                {/* Right: Timeline */}
                <div className="col-span-2">
                    <div className="timeline">
                        {/* Item 1 */}
                        <div className="timeline-item">
                            <div className="timeline-dot"></div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Today, 10:30 AM</div>
                            <div className="timeline-content">
                                <span className="badge badge-success mb-2">Code Accepted</span>
                                <h4 style={{ fontSize: '1.125rem' }}>Two Sum Optimization</h4>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Sarah Connor approved your submission.</p>
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--success)', fontStyle: 'italic' }}>
                                    "Great use of Map for O(1) lookups."
                                </div>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="timeline-item">
                            <div className="timeline-dot" style={{ background: 'var(--warning)' }}></div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Yesterday, 4:00 PM</div>
                            <div className="timeline-content">
                                <span className="badge badge-warning mb-2">Feedback Received</span>
                                <h4 style={{ fontSize: '1.125rem' }}>API Integration Exercise</h4>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Sarah Connor requested changes.</p>
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--warning)', fontStyle: 'italic' }}>
                                    "Please add error handling for network failures."
                                </div>
                                <button className="btn btn-secondary" style={{ marginTop: '1rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}>Go to Workspace</button>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="timeline-item">
                            <div className="timeline-dot" style={{ background: 'var(--secondary)' }}></div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Aug 12, 9:00 AM</div>
                            <div className="timeline-content">
                                <span className="badge badge-success mb-2" style={{ background: 'var(--secondary)', color: 'white' }}>Milestone reached</span>
                                <h4 style={{ fontSize: '1.125rem' }}>Completed: Week 1 - Basics</h4>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>You have successfully completed all tasks for Week 1.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InternPerformance;
