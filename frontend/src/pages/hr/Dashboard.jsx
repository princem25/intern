import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getPendingUsers, updateUserStatus } from '../../api/admin';

const HRDashboard = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPendingUsers();
    }, []);

    const loadPendingUsers = async () => {
        setLoading(true);
        try {
            const users = await getPendingUsers();
            setPendingUsers(users);
        } catch (error) {
            console.error("Failed to load pending users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await updateUserStatus(id, 'approved');
            setPendingUsers(prev => prev.filter(u => u.id !== id));
            alert("User approved successfully");
        } catch (error) {
            alert("Failed to approve user");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this user?")) return;
        try {
            await updateUserStatus(id, 'rejected');
            setPendingUsers(prev => prev.filter(u => u.id !== id));
            alert("User rejected and removed from database");
        } catch (error) {
            alert("Failed to reject user");
        }
    };

    return (
        <DashboardLayout role="HR">
            <header id="overview" className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>HR Dashboard</h2>
                    <p className="text-muted">Manage Interns and Approvals</p>
                </div>
            </header>

            <div className="grid grid-responsive gap-6 mb-8">
                {/* KPI Cards */}
                <Card className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Pending Approvals</div>
                        <span className="badge badge-warning">Action Needed</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{pendingUsers.length}</div>
                </Card>
            </div>

            {/* Pending Approvals List */}
            <Card id="approvals" className="mb-8" style={{ padding: 0 }}>
                <div className="p-4 border-b" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>Pending Account Requests</h4>
                </div>
                {pendingUsers.length === 0 ? (
                    <div className="p-4 text-center text-muted">No pending requests.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {pendingUsers.map(user => (
                            <div key={user.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="avatar-sm" style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                        <div className="flex gap-2 mt-1">
                                            <span className="badge badge-secondary text-xs">{user.role?.name || 'Unknown Role'}</span>
                                            {user.technology && <span className="badge badge-primary text-xs">{user.technology.name}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <Button variant="success" size="sm" onClick={() => handleApprove(user.id)}>
                                        <i className="fa-solid fa-check mr-1"></i> Approve
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => handleReject(user.id)}>
                                        <i className="fa-solid fa-xmark mr-1"></i> Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </DashboardLayout>
    );
};

export default HRDashboard;
