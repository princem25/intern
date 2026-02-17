import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const InternProfile = () => {
    return (
        <DashboardLayout role="Intern">
            <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>My Profile</h2>
            </header>

            <div className="grid grid-responsive gap-8">
                {/* Profile Card */}
                <Card className="p-6" style={{ textAlign: 'center' }}>
                    <div style={{ width: '100px', height: '100px', background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '2.5rem', margin: '0 auto 1.5rem' }}>
                        JD
                    </div>
                    <h3 className="mb-2">John Doe</h3>
                    <p className="text-muted mb-4">Frontend Intern</p>
                    <div className="badge badge-success mb-6">Active</div>

                    <div style={{ textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <div className="mb-4">
                            <label className="input-label" style={{ color: 'var(--text-muted)' }}>Email</label>
                            <div className="font-medium">john.doe@example.com</div>
                        </div>

                        <div>
                            <label className="input-label" style={{ color: 'var(--text-muted)' }}>Joined</label>
                            <div className="font-medium">Oct 10, 2026</div>
                        </div>
                    </div>
                </Card>

                {/* Edit Details Form */}
                <div className="col-span-2">
                    <Card className="p-6 mb-8">
                        <h3 className="mb-6">Edit Profile</h3>
                        <form>
                            <div className="mb-4">
                                <label className="input-label">Full Name</label>
                                <input type="text" className="input-field" defaultValue="John Doe" name="name" />
                            </div>
                            <div className="mb-6">
                                <label className="input-label">Email</label>
                                <input type="email" className="input-field" defaultValue="john.doe@example.com" name="email" />
                            </div>
                            <div className="flex justify-between items-center">
                                <Button variant="secondary" type="button">Cancel</Button>
                                <Button variant="primary" type="button">Save Changes</Button>
                            </div>
                        </form>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-6">Security</h3>
                        <form>
                            <div className="mb-4">
                                <label className="input-label">Current Password</label>
                                <input type="password" className="input-field" placeholder="Enter current password" />
                            </div>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="input-label">New Password</label>
                                    <input type="password" className="input-field" placeholder="Enter new password" />
                                </div>
                                <div>
                                    <label className="input-label">Confirm New Password</label>
                                    <input type="password" className="input-field" placeholder="Confirm new password" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div></div>
                                <Button variant="secondary" type="button">Update Password</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InternProfile;
