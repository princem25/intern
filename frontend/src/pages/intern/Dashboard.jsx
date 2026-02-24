import React, { useState, useEffect } from 'react';
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

const DiffBadge = ({ level }) => {
    const cfg = { basic: { c: '#10B981', bg: 'rgba(16,185,129,0.12)', l: 'Basic' }, medium: { c: '#F59E0B', bg: 'rgba(245,158,11,0.12)', l: 'Medium' }, hard: { c: '#EF4444', bg: 'rgba(239,68,68,0.12)', l: 'Hard' } }[level] || { c: 'var(--text-muted)', bg: 'var(--bg-body)', l: level };
    return <span style={{ padding: '0.2rem 0.6rem', background: cfg.bg, color: cfg.c, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>{cfg.l}</span>;
};

const InternDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        (async () => {
            try {
                const r = await apiFetch(`${config.API_BASE_URL}/me/stats`);
                if (r?.ok) setStats(await r.json());
            } catch { }
            finally { setLoading(false); }
        })();
    }, []);

    const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const scoreColor = s => s >= 80 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

    const kpiCards = [
        { label: 'Technology', value: loading ? '…' : (stats?.technology || user?.technology?.name || '—'), icon: 'fa-microchip', color: 'var(--primary)' },
        { label: 'Tasks Done', value: loading ? '…' : (stats?.done ?? 0), icon: 'fa-circle-check', color: '#10B981' },
        { label: 'In Progress', value: loading ? '…' : (stats?.in_progress ?? 0), icon: 'fa-spinner', color: '#F59E0B' },
        { label: 'Avg Score', value: loading ? '…' : (stats?.avg_score != null ? `${stats.avg_score}` : 'N/A'), icon: 'fa-star', color: '#F59E0B' },
    ];

    return (
        <DashboardLayout role="Intern">
            {/* Greeting */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ margin: 0 }}>Welcome back, {user?.name?.split(' ')[0] || 'Intern'} 👋</h2>
                <p className="text-muted" style={{ marginTop: '0.25rem' }}>Here's your current progress overview.</p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {kpiCards.map(c => (
                    <Card key={c.label} style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{c.label}</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
                        <i className={`fa-solid ${c.icon}`} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '2rem', color: c.color, opacity: 0.12 }}></i>
                    </Card>
                ))}
            </div>

            {/* Active Task */}
            <Card style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Task</div>
                        {loading ? (
                            <div style={{ color: 'var(--text-muted)' }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Loading…</div>
                        ) : stats?.active_task ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0 }}>{stats.active_task.title}</h3>
                                    <DiffBadge level={stats.active_task.difficulty} />
                                    <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(245,158,11,0.12)', color: '#F59E0B', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>In Progress</span>
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                                    <i className="fa-solid fa-user" style={{ marginRight: '0.4rem' }}></i>
                                    Assigned by {stats.active_task.creator?.name}
                                    {stats.active_task.due_date && <><span style={{ margin: '0 0.5rem' }}>•</span><i className="fa-solid fa-calendar" style={{ marginRight: '0.4rem' }}></i>Due {formatDate(stats.active_task.due_date)}</>}
                                </div>
                                <Link to="/intern/workspace"><Button variant="primary">Go to Workspace <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i></Button></Link>
                            </>
                        ) : (
                            <div>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No active task right now. Check your workspace for pending tasks.</p>
                                <Link to="/intern/workspace"><Button variant="secondary">View All Tasks</Button></Link>
                            </div>
                        )}
                    </div>
                    <div style={{ width: 100, height: 100, background: 'var(--bg-body)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fa-solid fa-code" style={{ fontSize: '2.5rem', color: 'var(--border)' }}></i>
                    </div>
                </div>
            </Card>

            {/* Recent Feedback */}
            <div>
                <h3 style={{ marginBottom: '1rem' }}>Recent Feedback</h3>
                {loading ? (
                    <div style={{ color: 'var(--text-muted)', padding: '1rem' }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Loading…</div>
                ) : !stats?.recent_feedback?.length ? (
                    <Card style={{ padding: '2rem', textAlign: 'center' }}>
                        <i className="fa-solid fa-comment-dots" style={{ fontSize: '2.5rem', color: 'var(--border)', display: 'block', marginBottom: '0.75rem' }}></i>
                        <p className="text-muted">No feedback yet. Submit a task to get started!</p>
                    </Card>
                ) : (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-body)' }}>
                                    {['Task', 'Difficulty', 'Score', 'Feedback', 'Reviewed'].map(h => (
                                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_feedback.map((t, i) => (
                                    <tr key={t.id} style={{ borderBottom: i < stats.recent_feedback.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}><DiffBadge level={t.difficulty} /></td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{ fontWeight: 700, color: scoreColor(t.score), fontSize: '0.9rem' }}>{t.score}/100</span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', fontSize: '0.8375rem', maxWidth: '280px' }}>
                                            <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.feedback}</span>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(t.reviewed_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default InternDashboard;
