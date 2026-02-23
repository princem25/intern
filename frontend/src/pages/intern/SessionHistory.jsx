import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';

const InternSessionHistory = () => {
    return (
        <DashboardLayout role="Intern">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Session History</h2>
                <Button variant="primary">Request Extra Hours</Button>
            </header>

            <Card className="p-6">
                <h3 className="mb-6">Recent Login Activity</h3>
                <div className="overflow-x-auto">
                    <table className="feedback-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Duration</th>
                                <th>Active Minutes</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Oct 25, 2026 10:30 AM</td>
                                <td>Active now</td>
                                <td>-</td>
                                <td><span className="badge badge-success">Active</span></td>
                            </tr>
                            <tr>
                                <td>Oct 24, 2026 09:15 AM</td>
                                <td>4h 20m</td>
                                <td>260</td>
                                <td><span className="badge badge-secondary">Completed</span></td>
                            </tr>
                            <tr>
                                <td>Oct 23, 2026 02:45 PM</td>
                                <td>15m</td>
                                <td>15</td>
                                <td><span className="badge badge-secondary">Completed</span></td>
                            </tr>
                            <tr>
                                <td>Oct 22, 2026 11:00 AM</td>
                                <td>2h 10m</td>
                                <td>130</td>
                                <td><span className="badge badge-secondary">Completed</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </DashboardLayout>
    );
};

export default InternSessionHistory;
