import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getHRStats, getUsers } from '../../api/admin';

const HRDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [recentPending, setRecentPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, pendingData] = await Promise.all([
                getHRStats(),
                getUsers({ status: 'pending' }),
            ]);
            setStats(statsData);
            setRecentPending(pendingData.slice(0, 5));
        } catch (err) {
            console.error('Failed to load HR dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const kpiCards = [
        {
            label: 'Total Registrations',
            value: stats.total,
            icon: 'fa-users',
            color: 'var(--primary)',
            bg: 'rgba(79,70,229,0.1)',
        },
        {
            label: 'Pending Approvals',
            value: stats.pending,
            icon: 'fa-user-clock',
            color: 'var(--warning)',
            bg: 'rgba(245,158,11,0.1)',
            badge: stats.pending > 0 ? 'Action Needed' : null,
            badgeColor: 'warning',
        },
        {
            label: 'Approved Members',
            value: stats.approved,
            icon: 'fa-user-check',
            color: 'var(--success)',
            bg: 'rgba(16,185,129,0.1)',
        },
        {
            label: 'Rejected',
            value: stats.rejected,
            icon: 'fa-user-xmark',
            color: 'var(--danger)',
            bg: 'rgba(239,68,68,0.1)',
        },
    ];

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    };

    const getRoleBadge = (roleName) => {
        const map = { intern: 'primary', teamlead: 'warning', hr: 'secondary', admin: 'secondary' };
        return map[roleName] || 'secondary';
    };

    return (
        <DashboardLayout role="HR">
            {/* ── Page Header ── */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 style={{ margin: 0 }}>HR Dashboard</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                        Oversee registrations, approve members, and manage system access.
                    </p>
                </div>
                <Button to="/hr/approvals" variant="primary">
                    <i className="fa-solid fa-user-clock" style={{ marginRight: '0.5rem' }}></i>
                    Review Pending
                    {stats.pending > 0 && (
                        <span style={{
                            marginLeft: '0.5rem',
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '999px',
                            padding: '0 6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                        }}>
                            {stats.pending}
                        </span>
                    )}
                </Button>
            </header>

            {/* ── KPI Cards ── */}
            <div className="grid grid-responsive gap-6 mb-8">
                {kpiCards.map((card) => (
                    <Card key={card.label} className="p-6" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                                    {card.label}
                                </div>
                                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
                                    {loading ? '—' : card.value}
                                </div>
                                {card.badge && (
                                    <span className={`badge badge-${card.badgeColor}`} style={{ marginTop: '0.5rem' }}>
                                        {card.badge}
                                    </span>
                                )}
                            </div>
                            <div style={{
                                width: 48, height: 48,
                                background: card.bg,
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <i className={`fa-solid ${card.icon}`} style={{ fontSize: '1.25rem', color: card.color }}></i>
                            </div>
                        </div>
                        {/* Decorative bar */}
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: '3px', background: card.color, opacity: 0.4,
                        }} />
                    </Card>
                ))}
            </div>

            {/* ── Recent Pending Requests ── */}
            <Card style={{ padding: 0 }} className="mb-8">
                <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h4 style={{ margin: 0 }}>
                        <i className="fa-solid fa-user-clock text-primary" style={{ marginRight: '0.5rem' }}></i>
                        Recent Pending Requests
                    </h4>
                    <Link to="/hr/approvals" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>
                        View All <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.25rem' }}></i>
                    </Link>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-muted">
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
                        <p>Loading...</p>
                    </div>
                ) : recentPending.length === 0 ? (
                    <div className="p-8 text-center">
                        <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: 'var(--success)', marginBottom: '0.75rem', display: 'block' }}></i>
                        <p className="font-medium">All caught up!</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>No pending approval requests at this time.</p>
                    </div>
                ) : (
                    <div>
                        {recentPending.map((user, idx) => (
                            <div
                                key={user.id}
                                className="flex justify-between items-center p-4"
                                style={{
                                    borderBottom: idx < recentPending.length - 1 ? '1px solid var(--border)' : 'none',
                                    transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-body)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div style={{
                                        width: 42, height: 42,
                                        borderRadius: '50%',
                                        background: 'var(--gradient-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 700, fontSize: '1rem',
                                        flexShrink: 0,
                                    }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                        <div className="flex gap-2" style={{ marginTop: '0.25rem' }}>
                                            <span className={`badge badge-${getRoleBadge(user.role?.name)}`}>
                                                {user.role?.name || 'Unknown'}
                                            </span>
                                            {user.technology && (
                                                <span className="badge badge-secondary">{user.technology.name}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        {formatDate(user.created_at)}
                                    </span>
                                    <Link to="/hr/approvals">
                                        <Button variant="secondary" size="sm">
                                            Review <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.25rem' }}></i>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-2 gap-6">
                <Card className="p-6">
                    <h4 style={{ marginBottom: '0.75rem' }}>
                        <i className="fa-solid fa-bolt text-primary" style={{ marginRight: '0.5rem' }}></i>
                        Quick Actions
                    </h4>
                    <div className="flex flex-col gap-3">
                        <Button to="/hr/approvals" variant="primary" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                            <i className="fa-solid fa-user-check"></i> Review Pending Approvals
                        </Button>
                        <Button to="/hr/members" variant="secondary" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                            <i className="fa-solid fa-users"></i> View All Members
                        </Button>
                        <Button to="/hr/audit-log" variant="secondary" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                            <i className="fa-solid fa-clipboard-list"></i> View Audit Log
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h4 style={{ marginBottom: '0.75rem' }}>
                        <i className="fa-solid fa-circle-info text-primary" style={{ marginRight: '0.5rem' }}></i>
                        System Status
                    </h4>
                    <div className="flex flex-col gap-3">
                        {[
                            { label: 'Approval Rate', value: stats.total > 0 ? `${Math.round((stats.approved / stats.total) * 100)}%` : '—', color: 'var(--success)' },
                            { label: 'Rejection Rate', value: stats.total > 0 ? `${Math.round((stats.rejected / stats.total) * 100)}%` : '—', color: 'var(--danger)' },
                            { label: 'Pending Rate', value: stats.total > 0 ? `${Math.round((stats.pending / stats.total) * 100)}%` : '—', color: 'var(--warning)' },
                        ].map(item => (
                            <div key={item.label} className="flex justify-between items-center">
                                <span className="text-muted" style={{ fontSize: '0.875rem' }}>{item.label}</span>
                                <span style={{ fontWeight: 700, color: item.color }}>{loading ? '—' : item.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default HRDashboard;
