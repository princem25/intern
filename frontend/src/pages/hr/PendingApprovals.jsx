import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getUsers, updateUserStatus } from '../../api/admin';

/* ─── Profile Detail Modal ─────────────────────────────────────────────── */
const ProfileModal = ({ user, onClose, onApprove, onReject }) => {
    if (!user) return null;

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : '—';

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.2s ease',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-xl)',
                    width: '100%', maxWidth: '520px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    overflow: 'hidden',
                    animation: 'slideUp 0.25s ease',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{
                    background: 'var(--gradient-primary)',
                    padding: '1.5rem',
                    position: 'relative',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none', borderRadius: '50%',
                            width: 32, height: 32, cursor: 'pointer',
                            color: 'white', fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: 64, height: 64,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.75rem', fontWeight: 800, color: 'white',
                            border: '3px solid rgba(255,255,255,0.4)',
                        }}>
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>{user.name}</h3>
                            <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                                {user.email}
                            </p>
                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <span style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                }}>
                                    <i className="fa-solid fa-briefcase" style={{ marginRight: '0.3rem' }}></i>
                                    {user.role?.name || 'Unknown'}
                                </span>
                                {user.status && (
                                    <span style={{
                                        background: user.status === 'pending' ? 'rgba(245,158,11,0.3)' :
                                            user.status === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
                                        color: 'white',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                    }}>
                                        {user.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div style={{ padding: '1.5rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Profile Information
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Full Name', value: user.name, icon: 'fa-user' },
                            { label: 'Email Address', value: user.email, icon: 'fa-envelope' },
                            { label: 'Role Applied For', value: user.role?.name || '—', icon: 'fa-id-badge' },
                            { label: 'Technology Stack', value: user.technology?.name || 'Not Specified', icon: 'fa-code' },
                            { label: 'Applied On', value: formatDate(user.created_at), icon: 'fa-calendar' },
                            { label: 'Account Status', value: user.status, icon: 'fa-circle-info' },
                        ].map((field) => (
                            <div key={field.label} style={{
                                background: 'var(--bg-body)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.75rem',
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                    <i className={`fa-solid ${field.icon}`}></i>
                                    {field.label}
                                </div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                    {field.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions (only for pending) */}
                    {user.status === 'pending' && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => onApprove(user.id)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'var(--success)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.9375rem',
                                    transition: 'opacity 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <i className="fa-solid fa-check"></i> Approve
                            </button>
                            <button
                                onClick={() => onReject(user.id, user.name)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'var(--danger)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.9375rem',
                                    transition: 'opacity 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <i className="fa-solid fa-xmark"></i> Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─── Rejection Reason Modal ───────────────────────────────────────────── */
const RejectModal = ({ targetName, onConfirm, onCancel }) => {
    const [reason, setReason] = useState('');

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1100,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                backdropFilter: 'blur(4px)',
            }}
        >
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                width: '100%', maxWidth: '440px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                overflow: 'hidden',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <div style={{
                        width: 40, height: 40,
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '1.1rem',
                    }}>
                        <i className="fa-solid fa-user-xmark"></i>
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: 'white' }}>Reject Account</h4>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)' }}>
                            {targetName}
                        </p>
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.875rem', fontWeight: 600,
                            marginBottom: '0.5rem', color: 'var(--text-main)',
                        }}>
                            Rejection Reason <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Incomplete information, invalid credentials, duplicate account..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-body)',
                                color: 'var(--text-main)',
                                fontSize: '0.875rem',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--danger)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                            This reason will be stored in the audit log.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: 'var(--bg-body)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600, cursor: 'pointer',
                                color: 'var(--text-main)',
                                transition: 'all 0.2s',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(reason)}
                            style={{
                                flex: 1, padding: '0.75rem',
                                background: 'var(--danger)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600, cursor: 'pointer',
                                color: 'white',
                                transition: 'opacity 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <i className="fa-solid fa-ban"></i> Confirm Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Toast Notification ───────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--primary)' };
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };

    return (
        <div style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem',
            background: 'var(--bg-card)',
            border: `1px solid ${colors[type] || 'var(--border)'}`,
            borderLeft: `4px solid ${colors[type] || 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            zIndex: 2000,
            minWidth: '280px',
            animation: 'slideInRight 0.3s ease',
        }}>
            <i className={`fa-solid ${icons[type]}`} style={{ color: colors[type], fontSize: '1.1rem' }}></i>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}>
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    );
};

/* ─── Main PendingApprovals Component ──────────────────────────────────── */
const PendingApprovals = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [processingIds, setProcessingIds] = useState(new Set());

    const tabs = [
        { key: 'pending', label: 'Pending', icon: 'fa-user-clock', color: 'var(--warning)' },
        { key: 'approved', label: 'Approved', icon: 'fa-user-check', color: 'var(--success)' },
        { key: 'rejected', label: 'Rejected', icon: 'fa-user-xmark', color: 'var(--danger)' },
        { key: 'all', label: 'All', icon: 'fa-users', color: 'var(--primary)' },
    ];

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = { status: activeTab };
            if (roleFilter) params.role = roleFilter;
            if (search) params.search = search;
            const data = await getUsers(params);
            setUsers(data);
        } catch (err) {
            showToast('Failed to load users. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab, roleFilter, search]);

    useEffect(() => {
        const timeout = setTimeout(loadUsers, 300);
        return () => clearTimeout(timeout);
    }, [loadUsers]);

    const handleApprove = async (id) => {
        setProcessingIds(prev => new Set(prev).add(id));
        try {
            await updateUserStatus(id, 'approved');
            showToast('User approved successfully! They can now log in.', 'success');
            setSelectedUser(null);
            loadUsers();
        } catch {
            showToast('Failed to approve user. Please try again.', 'error');
        } finally {
            setProcessingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        }
    };

    const handleRejectClick = (id, name) => {
        setRejectTarget({ id, name });
        setSelectedUser(null);
    };

    const handleRejectConfirm = async (reason) => {
        if (!rejectTarget) return;
        const { id } = rejectTarget;
        setProcessingIds(prev => new Set(prev).add(id));
        setRejectTarget(null);
        try {
            await updateUserStatus(id, 'rejected', reason);
            showToast('User rejected. The action has been logged.', 'info');
            loadUsers();
        } catch {
            showToast('Failed to reject user. Please try again.', 'error');
        } finally {
            setProcessingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    }) : '—';

    const getRoleColor = (name) => ({
        intern: 'var(--primary)', teamlead: 'var(--warning)',
    }[name] || 'var(--text-muted)');

    const getStatusBadge = (status) => {
        const map = {
            pending: { text: 'Pending', bg: 'rgba(245,158,11,0.12)', color: 'var(--warning)' },
            approved: { text: 'Approved', bg: 'rgba(16,185,129,0.12)', color: 'var(--success)' },
            rejected: { text: 'Rejected', bg: 'rgba(239,68,68,0.12)', color: 'var(--danger)' },
        };
        return map[status] || { text: status, bg: 'var(--bg-body)', color: 'var(--text-muted)' };
    };

    return (
        <DashboardLayout role="HR">
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                @keyframes slideInRight { from { transform: translateX(100px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
                @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
                .user-row-hover:hover { background: var(--bg-body) !important; }
                .action-btn-approve:hover { background: #059669 !important; }
                .action-btn-reject:hover  { background: #DC2626 !important; }
            `}</style>

            {/* ── Header ── */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 style={{ margin: 0 }}>Pending Approvals</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                        Review and approve or reject new account registrations.
                    </p>
                </div>
                <Button variant="secondary" onClick={loadUsers}>
                    <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.5rem' }}></i> Refresh
                </Button>
            </header>

            {/* ── Tabs ── */}
            <div style={{
                display: 'flex', gap: '0.25rem',
                background: 'var(--bg-body)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.25rem',
                marginBottom: '1.5rem',
                width: 'fit-content',
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                            color: activeTab === tab.key ? tab.color : 'var(--text-muted)',
                            boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
                        }}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Filters ── */}
            <Card className="mb-6" style={{ padding: '1rem' }}>
                <div className="flex gap-3 items-center flex-wrap">
                    {/* Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{
                            position: 'absolute', left: '0.75rem', top: '50%',
                            transform: 'translateY(-50%)', color: 'var(--text-muted)',
                        }}></i>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '2.25rem', paddingRight: '0.75rem',
                                padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-body)',
                                color: 'var(--text-main)',
                                fontSize: '0.875rem',
                                outline: 'none',
                            }}
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        style={{
                            padding: '0.625rem 2rem 0.625rem 0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-body)',
                            color: 'var(--text-main)',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            outline: 'none',
                            minWidth: '140px',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="intern">Intern</option>
                        <option value="teamlead">Team Lead</option>
                    </select>

                    {/* Results count */}
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                        {loading ? 'Loading...' : `${users.length} result${users.length !== 1 ? 's' : ''}`}
                    </div>
                </div>
            </Card>

            {/* ── Users Table ── */}
            <Card style={{ padding: 0 }}>
                {/* Table Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 160px',
                    gap: '1rem',
                    padding: '0.875rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-body)',
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                }}>
                    {['User', 'Role', 'Technology', 'Registered', 'Actions'].map(col => (
                        <div key={col} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {col}
                        </div>
                    ))}
                </div>

                {/* Body */}
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner" style={{ fontSize: '2rem', marginBottom: '0.75rem', display: 'block', animation: 'spin 1s linear infinite' }}></i>
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <i className="fa-solid fa-inbox" style={{ fontSize: '3rem', color: 'var(--border)', display: 'block', marginBottom: '1rem' }}></i>
                        <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                            No {activeTab === 'all' ? '' : activeTab} users found
                        </p>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                            {search || roleFilter ? 'Try adjusting your filters.' : 'Nothing here yet.'}
                        </p>
                    </div>
                ) : (
                    users.map((user, idx) => {
                        const isProcessing = processingIds.has(user.id);
                        const statusBadge = getStatusBadge(user.status);

                        return (
                            <div
                                key={user.id}
                                className="user-row-hover"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr 160px',
                                    gap: '1rem',
                                    padding: '1rem 1.5rem',
                                    alignItems: 'center',
                                    borderBottom: idx < users.length - 1 ? '1px solid var(--border)' : 'none',
                                    background: 'transparent',
                                    transition: 'background 0.2s',
                                    opacity: isProcessing ? 0.5 : 1,
                                }}
                            >
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <div style={{
                                        width: 40, height: 40,
                                        borderRadius: '50%',
                                        background: 'var(--gradient-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 700, fontSize: '0.9375rem',
                                        flexShrink: 0,
                                    }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '0.25rem 0.6rem',
                                        background: `${getRoleColor(user.role?.name)}15`,
                                        color: getRoleColor(user.role?.name),
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                    }}>
                                        {user.role?.name || '—'}
                                    </span>
                                </div>

                                {/* Technology */}
                                <div style={{ fontSize: '0.875rem', color: user.technology ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    {user.technology?.name || '—'}
                                </div>

                                {/* Date */}
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                    {formatDate(user.created_at)}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 items-center">
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        title="View Profile"
                                        style={{
                                            padding: '0.4rem 0.6rem',
                                            background: 'var(--bg-body)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            color: 'var(--text-muted)',
                                            transition: 'all 0.2s',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        <i className="fa-solid fa-eye"></i>
                                    </button>

                                    {user.status === 'pending' && (
                                        <>
                                            <button
                                                className="action-btn-approve"
                                                onClick={() => handleApprove(user.id)}
                                                disabled={isProcessing}
                                                title="Approve"
                                                style={{
                                                    padding: '0.4rem 0.75rem',
                                                    background: 'var(--success)',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                    color: 'white',
                                                    transition: 'background 0.2s',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                }}
                                            >
                                                <i className="fa-solid fa-check"></i>
                                            </button>

                                            <button
                                                className="action-btn-reject"
                                                onClick={() => handleRejectClick(user.id, user.name)}
                                                disabled={isProcessing}
                                                title="Reject"
                                                style={{
                                                    padding: '0.4rem 0.75rem',
                                                    background: 'var(--danger)',
                                                    border: 'none',
                                                    borderRadius: 'var(--radius-sm)',
                                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                    color: 'white',
                                                    transition: 'background 0.2s',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                }}
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                        </>
                                    )}

                                    {user.status !== 'pending' && (
                                        <span style={{
                                            padding: '0.25rem 0.6rem',
                                            background: statusBadge.bg,
                                            color: statusBadge.color,
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}>
                                            {statusBadge.text}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </Card>

            {/* ── Modals ── */}
            {selectedUser && (
                <ProfileModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onApprove={(id) => { setSelectedUser(null); handleApprove(id); }}
                    onReject={(id, name) => { setSelectedUser(null); handleRejectClick(id, name); }}
                />
            )}

            {rejectTarget && (
                <RejectModal
                    targetName={rejectTarget.name}
                    onConfirm={handleRejectConfirm}
                    onCancel={() => setRejectTarget(null)}
                />
            )}

            {/* ── Toast ── */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </DashboardLayout>
    );
};

export default PendingApprovals;
