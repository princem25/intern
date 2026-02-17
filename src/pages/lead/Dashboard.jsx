import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const LeadDashboard = () => {
    return (
        <DashboardLayout role="Lead">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Intern Management</h2>
                    <p className="text-muted">Track progress and assign tasks to your team.</p>
                </div>
                <Button variant="primary">
                    <i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i> Assign New Task
                </Button>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-responsive gap-4" style={{ marginBottom: '2rem' }}>
                <Card className="p-4">
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Interns</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>12</div>
                </Card>
                <Card className="p-4">
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>Pending Reviews</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>4</div>
                </Card>
                <Card className="p-4">
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>Avg. Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>88%</div>
                </Card>
                <Card className="p-4">
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>On Track</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>10/12</div>
                </Card>
                <Card className="p-4">
                    <div className="text-muted" style={{ fontSize: '0.875rem' }}>On Track</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>10/12</div>
                </Card>
            </div>

            {/* Extra Hours Requests (New DB Feature) */}
            <Card className="mb-8" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="p-4 border-b" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Extra Hours Requests</h4>
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3">
                            <div className="avatar-sm" style={{ width: '32px', height: '32px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>JD</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>John Doe</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reason: "Studied offline docs" • 120 mins</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Reject</Button>
                            <Button variant="primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Approve</Button>
                        </div>
                    </div>
                    {/* Placeholder for no requests */}
                    <div className="text-center text-muted" style={{ fontSize: '0.875rem', padding: '1rem' }}>
                        No more pending requests
                    </div>
                </div>
            </Card>

            {/* Intern List Table */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div className="p-4 border-b flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Search interns..." className="input-field" style={{ width: '250px', padding: '0.5rem' }} />
                        <select className="input-field" style={{ width: '150px', padding: '0.5rem' }}>
                            <option>All Status</option>
                            <option>Active</option>
                            <option>At Risk</option>
                        </select>
                    </div>
                </div>

                <table className="feedback-table"> {/* Reusing feedback-table for similar styling */}
                    <thead>
                        <tr>
                            <th>Intern</th>
                            <th>Current Topic</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="avatar-sm" style={{ width: '32px', height: '32px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)' }}>JD</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>John Doe</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>john@example.com</div>
                                    </div>
                                </div>
                            </td>
                            <td>Advanced React Patterns</td>
                            <td>Advanced React Patterns</td>
                            <td style={{ width: '200px' }}>
                                <span className="badge badge-primary">In Progress</span>
                            </td>
                            <td><span className="badge badge-success">Active</span></td>
                            <td className="text-muted">2 mins ago</td>
                            <td>
                                <Button variant="secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View</Button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="avatar-sm" style={{ width: '32px', height: '32px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)' }}>AS</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Alice Smith</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>alice@example.com</div>
                                    </div>
                                </div>
                            </td>
                            <td>Node.js Basics</td>
                            <td>Node.js Basics</td>
                            <td style={{ width: '200px' }}>
                                <span className="badge badge-warning">Assigned</span>
                            </td>
                            <td><span className="badge badge-warning">At Risk</span></td>
                            <td className="text-muted">2 days ago</td>
                            <td>
                                <Button variant="secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View</Button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="avatar-sm" style={{ width: '32px', height: '32px', background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)' }}>RJ</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Robert Johnson</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>rob@example.com</div>
                                    </div>
                                </div>
                            </td>
                            <td>Database Design</td>
                            <td>Database Design</td>
                            <td style={{ width: '200px' }}>
                                <span className="badge badge-success">Completed</span>
                            </td>
                            <td><span className="badge badge-success">Completed</span></td>
                            <td className="text-muted">5 hours ago</td>
                            <td>
                                <Button variant="secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Card>
        </DashboardLayout>
    );
};

export default LeadDashboard;
