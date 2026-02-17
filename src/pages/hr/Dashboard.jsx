import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const HRDashboard = () => {
    return (
        <DashboardLayout role="HR">
            <header id="overview" className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Program Overview</h2>
                    <p className="text-muted">Summer Internship 2026 Batch Performance</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary"><i className="fa-solid fa-download" style={{ marginRight: '0.5rem' }}></i> Export Report</Button>
                    <Button variant="primary"><i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i> New Batch</Button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-responsive gap-6 mb-8">
                <Card className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Interns</div>
                        <span className="badge badge-success">+12%</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>48</div>
                </Card>
                <Card className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Avg Performance</div>
                        <span className="badge badge-success">+4%</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>85%</div>
                </Card>
                <Card className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Pending Users</div>
                        <span className="badge badge-warning">Action Needed</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>5</div>
                </Card>
            </div>

            <div className="grid grid-responsive gap-6 mb-8">
                {/* Performance Chart (CSS only for now) */}
                <Card className="col-span-2" id="reports" style={{ padding: 0 }}>
                    <div className="p-4 border-b flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>Department Performance</h4>
                        <select className="input-field" style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="chart-container">
                        <div className="bar" style={{ height: '70%' }} data-value="70%">
                            <span className="bar-label">Frontend</span>
                        </div>
                        <div className="bar" style={{ height: '85%' }} data-value="85%">
                            <span className="bar-label">Backend</span>
                        </div>
                        <div className="bar" style={{ height: '60%', background: 'var(--secondary)' }} data-value="60%">
                            <span className="bar-label">Design</span>
                        </div>
                        <div className="bar" style={{ height: '90%', background: 'var(--success)' }} data-value="90%">
                            <span className="bar-label">Data Sci</span>
                        </div>
                        <div className="bar" style={{ height: '75%', background: 'var(--warning)' }} data-value="75%">
                            <span className="bar-label">Marketing</span>
                        </div>
                    </div>
                </Card>

                {/* Pending Approvals */}
                <Card id="approvals" style={{ padding: 0 }}>
                    <div className="p-4 border-b" style={{ borderBottom: '1px solid var(--border)' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>New Registrations</h4>
                    </div>
                    <div className="flex flex-col">
                        <div className="p-4 border-b" style={{ borderBottom: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="avatar-sm" style={{ width: '32px', height: '32px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>MK</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Michael K.</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Technology: PHP</div>
                                </div>
                            </div>
                            <div className="mb-2">
                                <select className="input-field" style={{ fontSize: '0.75rem', padding: '0.25rem' }}>
                                    <option value="">Assign Team Lead...</option>
                                    <option value="2">Team Lead 1 (PHP)</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" style={{ width: '100%', padding: '0.25rem', fontSize: '0.75rem' }}>Approve & Assign</Button>
                                <Button variant="secondary" style={{ width: '100%', padding: '0.25rem', fontSize: '0.75rem' }}>Reject</Button>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="avatar-sm" style={{ width: '32px', height: '32px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>LJ</div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>LeBron J.</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied: Data Science</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" style={{ width: '100%', padding: '0.25rem', fontSize: '0.75rem' }}>Approve</Button>
                                <Button variant="secondary" style={{ width: '100%', padding: '0.25rem', fontSize: '0.75rem' }}>Reject</Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Top Performers Table */}
            <Card id="assignments" style={{ padding: 0 }}>
                <div className="p-4 border-b" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Top Performers</h4>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Intern</th>
                            <th>Department</th>
                            <th>Mentor</th>
                            <th>Score</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div style={{ width: '32px', height: '32px', background: 'var(--gradient-primary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>JD</div>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>John Doe</span>
                                </div>
                            </td>
                            <td>Frontend</td>
                            <td>Sarah Connor</td>
                            <td style={{ fontWeight: 700 }}>98/100</td>
                            <td><span className="badge badge-success">Excellent</span></td>
                        </tr>
                        <tr>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div style={{ width: '32px', height: '32px', background: 'var(--secondary)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>EW</div>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Emma Watson</span>
                                </div>
                            </td>
                            <td>Backend</td>
                            <td>Tony Stark</td>
                            <td style={{ fontWeight: 700 }}>95/100</td>
                            <td><span className="badge badge-success">Excellent</span></td>
                        </tr>
                    </tbody>
                </table>
            </Card>
        </DashboardLayout>
    );
};

export default HRDashboard;
