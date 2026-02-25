import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import config from '../../config';

const apiFetch = async (url, opts = {}) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(url, {
        ...opts,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(opts.headers || {}) },
    });
    if (r.status === 401) { localStorage.removeItem('auth_token'); localStorage.removeItem('user'); window.location.href = '/auth/login'; return null; }
    return r;
};

const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const color = { success: '#10B981', error: '#EF4444', info: 'var(--primary)' }[type] || 'var(--primary)';
    return (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 2000, background: 'var(--bg-card)', border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-lg)', display: 'flex', gap: '0.75rem', minWidth: '280px', alignItems: 'center' }}>
            <i className={`fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'}`} style={{ color, fontSize: '1.1rem' }}></i>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
    );
};

const InternProfile = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // Profile form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);

    // Password form
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdSaving, setPwdSaving] = useState(false);
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    useEffect(() => {
        (async () => {
            try {
                const [userRes, statsRes] = await Promise.all([
                    apiFetch(`${config.API_BASE_URL}/user`),
                    apiFetch(`${config.API_BASE_URL}/me/stats`),
                ]);
                if (userRes) {
                    const u = await userRes.json();
                    setUser(u);
                    setName(u.name || '');
                    setEmail(u.email || '');
                }
                if (statsRes) setStats(await statsRes.json());
            } catch { showToast('Failed to load profile.', 'error'); }
            finally { setLoading(false); }
        })();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!name.trim()) { showToast('Name is required.', 'error'); return; }
        setProfileSaving(true);
        try {
            const r = await apiFetch(`${config.API_BASE_URL}/profile`, {
                method: 'PUT',
                body: JSON.stringify({ name: name.trim(), email: email.trim() }),
            });
            if (!r) return;
            const data = await r.json();
            if (!r.ok) { showToast(data.message || 'Update failed.', 'error'); return; }
            setUser(data.user);
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Profile updated successfully!');
        } catch { showToast('Network error.', 'error'); }
        finally { setProfileSaving(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!currentPwd || !newPwd || !confirmPwd) { showToast('All password fields are required.', 'error'); return; }
        if (newPwd.length < 8) { showToast('New password must be at least 8 characters.', 'error'); return; }
        if (newPwd !== confirmPwd) { showToast('New passwords do not match.', 'error'); return; }
        setPwdSaving(true);
        try {
            const r = await apiFetch(`${config.API_BASE_URL}/change-password`, {
                method: 'PUT',
                body: JSON.stringify({ current_password: currentPwd, new_password: newPwd, new_password_confirmation: confirmPwd }),
            });
            if (!r) return;
            const data = await r.json();
            if (!r.ok) { showToast(data.message || 'Failed to change password.', 'error'); return; }
            showToast('Password changed successfully!');
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        } catch { showToast('Network error.', 'error'); }
        finally { setPwdSaving(false); }
    };

    const inp = { width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };

    if (loading) {
        return (
            <DashboardLayout role="Intern">
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i> Loading profile…
                </div>
            </DashboardLayout>
        );
    }

    const avatar = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
    const roleName = user?.role?.name || 'intern';
    const techName = user?.technology?.name || '—';
    const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <DashboardLayout role="Intern">
            <header style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>My Profile</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Manage your account information and security</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* LEFT: Profile Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Avatar Card */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: 90, height: 90, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '2rem', margin: '0 auto 1rem', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                            {avatar}
                        </div>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{user?.name}</h3>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 0.75rem', fontSize: '0.85rem' }}>{techName} • {roleName}</p>
                        <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem', background: user?.status === 'approved' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: user?.status === 'approved' ? '#10B981' : '#F59E0B', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>{user?.status}</span>

                        <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.25rem', paddingTop: '1.25rem', textAlign: 'left' }}>
                            <div style={{ marginBottom: '0.85rem' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Email</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user?.email}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.2rem' }}>Joined</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{joined}</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    {stats && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.75rem' }}>Task Stats</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {[
                                    { label: 'Total', value: stats.total || 0, color: 'var(--primary)', icon: 'fa-list-check' },
                                    { label: 'Done', value: stats.done || 0, color: '#10B981', icon: 'fa-circle-check' },
                                    { label: 'In Progress', value: stats.in_progress || 0, color: '#F59E0B', icon: 'fa-spinner' },
                                    { label: 'Avg Score', value: stats.avg_score != null ? stats.avg_score : '—', color: '#8B5CF6', icon: 'fa-star' },
                                ].map(s => (
                                    <div key={s.label} style={{ padding: '0.65rem', background: 'var(--bg-body)', borderRadius: '10px', textAlign: 'center' }}>
                                        <i className={`fa-solid ${s.icon}`} style={{ color: s.color, fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}></i>
                                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Edit Forms */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Edit Profile */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fa-solid fa-user-pen" style={{ color: 'var(--primary)' }}></i> Edit Profile
                        </h3>
                        <form onSubmit={handleProfileUpdate}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.4rem' }}>Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} style={inp} required />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.4rem' }}>Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} required />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" onClick={() => { setName(user?.name || ''); setEmail(user?.email || ''); }} style={{ padding: '0.6rem 1.25rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.85rem' }}>Cancel</button>
                                <button type="submit" disabled={profileSaving} style={{ padding: '0.6rem 1.5rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: profileSaving ? 'not-allowed' : 'pointer', opacity: profileSaving ? 0.7 : 1, fontSize: '0.85rem' }}>
                                    {profileSaving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fa-solid fa-shield-halved" style={{ color: '#F59E0B' }}></i> Change Password
                        </h3>
                        <form onSubmit={handlePasswordChange}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.4rem' }}>Current Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showCurrentPwd ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="Enter current password" style={{ ...inp, paddingRight: '2.5rem' }} required />
                                    <button type="button" onClick={() => setShowCurrentPwd(v => !v)} tabIndex={-1} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <i className={`fa-solid ${showCurrentPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.4rem' }}>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showNewPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 8 characters" style={{ ...inp, paddingRight: '2.5rem' }} required />
                                        <button type="button" onClick={() => setShowNewPwd(v => !v)} tabIndex={-1} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            <i className={`fa-solid ${showNewPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.4rem' }}>Confirm Password</label>
                                    <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repeat new password" style={inp} required />
                                </div>
                            </div>
                            {newPwd && newPwd.length < 8 && (
                                <div style={{ fontSize: '0.78rem', color: '#EF4444', marginBottom: '0.75rem' }}>
                                    <i className="fa-solid fa-circle-info" style={{ marginRight: '0.3rem' }}></i>
                                    Password must be at least 8 characters
                                </div>
                            )}
                            {newPwd && confirmPwd && newPwd !== confirmPwd && (
                                <div style={{ fontSize: '0.78rem', color: '#EF4444', marginBottom: '0.75rem' }}>
                                    <i className="fa-solid fa-circle-info" style={{ marginRight: '0.3rem' }}></i>
                                    Passwords do not match
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" disabled={pwdSaving} style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #F59E0B, #D97706)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: pwdSaving ? 'not-allowed' : 'pointer', opacity: pwdSaving ? 0.7 : 1, fontSize: '0.85rem' }}>
                                    {pwdSaving ? 'Updating…' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Account Info */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fa-solid fa-circle-info" style={{ color: 'var(--text-muted)' }}></i> Account Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {[
                                { label: 'Role', value: roleName, icon: 'fa-briefcase' },
                                { label: 'Technology', value: techName, icon: 'fa-code' },
                                { label: 'Status', value: user?.status, icon: 'fa-shield' },
                                { label: 'Member Since', value: joined, icon: 'fa-calendar' },
                            ].map(item => (
                                <div key={item.label} style={{ padding: '0.75rem', background: 'var(--bg-body)', borderRadius: '10px' }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        <i className={`fa-solid ${item.icon}`} style={{ marginRight: '0.3rem' }}></i>{item.label}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </DashboardLayout>
    );
};

export default InternProfile;
