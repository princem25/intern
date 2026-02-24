import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import config from '../../config';

const apiFetch = async (url) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(url, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
    if (r.status === 401) { localStorage.removeItem('auth_token'); localStorage.removeItem('user'); window.location.href = '/auth/login'; return; }
    return r;
};

const initials = name => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

const LeadDashboard = () => {
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [sr, tr] = await Promise.all([
                apiFetch(`${config.API_BASE_URL}/me/stats`),
                apiFetch(`${config.API_BASE_URL}/tasks?status=in_progress`),
            ]);
            if (sr?.ok) setStats(await sr.json());
            if (tr?.ok) setTasks(await tr.json());
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const scoreColor = s => s >= 80 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';
    const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    // Pending reviews = in_progress tasks with submission and no review
    const pendingReviews = tasks.filter(t => t.submission && !t.reviewed_at);

    // Interns from stats, filtered by search
    const interns = (stats?.interns || []).filter(i =>
        !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase())
    );

    const kpiCards = [
        { label: 'My Interns', value: stats?.total_interns ?? '—', color: 'var(--primary)', icon: 'fa-users' },
        { label: 'Pending Reviews', value: stats?.pending_review ?? '—', color: '#F59E0B', icon: 'fa-clock' },
        { label: 'Tasks Completed', value: stats?.done ?? '—', color: '#10B981', icon: 'fa-circle-check' },
        { label: 'Avg Score', value: stats?.avg_score != null ? `${stats.avg_score}` : 'N/A', color: '#F59E0B', icon: 'fa-star' },
    ];

    return (
        <DashboardLayout role="Lead">
            {/* Header */}
            <header className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Welcome, {user?.name?.split(' ')[0] || 'Lead'} 👋</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>Track your team's progress and pending reviews.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>
                    <Link to="/lead/topics" style={{ textDecoration: 'none' }}>
                        <Button variant="primary"><i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i> New Task</Button>
                    </Link>
                </div>
            </header>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {kpiCards.map(c => (
                    <Card key={c.label} style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{c.label}</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: c.color, lineHeight: 1 }}>{loading ? '…' : c.value}</div>
                        <i className={`fa-solid ${c.icon}`} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '2rem', color: c.color, opacity: 0.12 }}></i>
                    </Card>
                ))}
            </div>

            {/* Pending Reviews Alert */}
            {!loading && pendingReviews.length > 0 && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-bell" style={{ color: '#F59E0B', fontSize: '1.25rem' }}></i>
                        <div>
                            <div style={{ fontWeight: 700 }}>{pendingReviews.length} submission{pendingReviews.length > 1 ? 's' : ''} awaiting review</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                {pendingReviews.map(t => t.assignee?.name).filter(Boolean).join(', ')}
                            </div>
                        </div>
                    </div>
                    <Link to="/lead/review" style={{ textDecoration: 'none' }}>
                        <button style={{ padding: '0.5rem 1.25rem', background: '#F59E0B', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                            Review Now <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.4rem' }}></i>
                        </button>
                    </Link>
                </div>
            )}

            {/* My Interns Table */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h4 style={{ margin: 0 }}>My Interns</h4>
                    <div style={{ position: 'relative' }}>
                        <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
                        <input type="text" placeholder="Search interns…" value={search} onChange={e => setSearch(e.target.value)}
                            style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none', width: '220px' }} />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i>Loading interns…
                    </div>
                ) : interns.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <i className="fa-solid fa-users" style={{ fontSize: '2.5rem', color: 'var(--border)', display: 'block', marginBottom: '0.75rem' }}></i>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No interns assigned yet</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>HR will assign interns to your team.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-body)' }}>
                                {['Intern', 'Technology', 'Status', 'Assigned On', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {interns.map((intern, idx) => (
                                <tr key={intern.id} style={{ borderBottom: idx < interns.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <td style={{ padding: '0.875rem 1.25rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>{initials(intern.name)}</div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{intern.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{intern.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem' }}>{intern.technology?.name || '—'}</td>
                                    <td style={{ padding: '0.875rem 1.25rem' }}>
                                        <span style={{ padding: '0.2rem 0.65rem', background: intern.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: intern.is_active ? '#10B981' : '#F59E0B', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {intern.is_active ? 'Active' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(intern.assigned_at)}</td>
                                    <td style={{ padding: '0.875rem 1.25rem' }}>
                                        <Link to="/lead/topics" style={{ textDecoration: 'none' }}>
                                            <button style={{ padding: '0.375rem 0.875rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                <i className="fa-solid fa-list-check" style={{ marginRight: '0.3rem' }}></i>Tasks
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </DashboardLayout>
    );
};

export default LeadDashboard;
