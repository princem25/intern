import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
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

const InternPerformance = () => {
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        (async () => {
            try {
                const [sr, tr] = await Promise.all([
                    apiFetch(`${config.API_BASE_URL}/me/stats`),
                    apiFetch(`${config.API_BASE_URL}/tasks`),
                ]);
                if (sr?.ok) setStats(await sr.json());
                if (tr?.ok) setTasks(await tr.json());
            } catch { }
            finally { setLoading(false); }
        })();
    }, []);

    const formatDate = d => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    const scoreColor = s => s >= 80 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

    // Compute completion % per difficulty from real tasks
    const difficultyStats = ['basic', 'medium', 'hard'].map(d => {
        const ofDiff = tasks.filter(t => t.difficulty === d);
        const done = ofDiff.filter(t => t.status === 'done').length;
        const pct = ofDiff.length ? Math.round((done / ofDiff.length) * 100) : 0;
        return { label: d.charAt(0).toUpperCase() + d.slice(1), pct, total: ofDiff.length, done };
    });

    const diffColors = { Basic: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };

    // Timeline = reviewed tasks ordered by reviewed_at desc
    const timeline = [...tasks]
        .filter(t => t.reviewed_at)
        .sort((a, b) => new Date(b.reviewed_at) - new Date(a.reviewed_at))
        .slice(0, 8);

    return (
        <DashboardLayout role="Intern">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: 0 }}>Performance History</h2>
                <p className="text-muted" style={{ marginTop: '0.25rem' }}>Your task completion and feedback timeline.</p>
            </header>

            {/* Summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Assigned', value: stats?.total ?? '—', color: 'var(--primary)', icon: 'fa-list-check' },
                    { label: 'Completed', value: stats?.done ?? '—', color: '#10B981', icon: 'fa-circle-check' },
                    { label: 'In Progress', value: stats?.in_progress ?? '—', color: '#F59E0B', icon: 'fa-spinner' },
                    { label: 'Avg Score', value: stats?.avg_score != null ? `${stats.avg_score}` : 'N/A', color: '#F59E0B', icon: 'fa-star' },
                ].map(c => (
                    <Card key={c.label} style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{c.label}</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: c.color, lineHeight: 1 }}>{loading ? '…' : c.value}</div>
                        <i className={`fa-solid ${c.icon}`} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '2rem', color: c.color, opacity: 0.12 }}></i>
                    </Card>
                ))}
            </div>

            <div className="grid grid-responsive gap-8">
                {/* Left: Skill Breakdown by difficulty */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Card style={{ padding: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1.25rem' }}>Completion by Difficulty</h4>
                        {loading ? (
                            <div className="text-muted"><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Loading…</div>
                        ) : difficultyStats.map(d => (
                            <div key={d.label} style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
                                    <span style={{ fontWeight: 600, color: diffColors[d.label] }}>{d.label}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>{d.done}/{d.total} tasks ({d.pct}%)</span>
                                </div>
                                <div style={{ height: 8, background: 'var(--bg-body)', borderRadius: 4 }}>
                                    <div style={{ width: `${d.pct}%`, height: '100%', background: diffColors[d.label], borderRadius: 4, transition: 'width 0.6s ease' }}></div>
                                </div>
                            </div>
                        ))}
                        {!loading && difficultyStats.every(d => d.total === 0) && (
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>No tasks assigned yet.</p>
                        )}
                    </Card>

                    {/* Score Distribution */}
                    {!loading && tasks.filter(t => t.score !== null).length > 0 && (
                        <Card style={{ padding: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1.25rem' }}>Score Distribution</h4>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: 120, justifyContent: 'space-around' }}>
                                {['0-49', '50-69', '70-84', '85-100'].map(range => {
                                    const [lo, hi] = range.split('-').map(Number);
                                    const cnt = tasks.filter(t => t.score != null && t.score >= lo && t.score <= hi).length;
                                    const total = tasks.filter(t => t.score != null).length;
                                    const pct = total ? Math.round((cnt / total) * 100) : 0;
                                    const color = hi < 50 ? '#EF4444' : hi < 70 ? '#F59E0B' : hi < 85 ? '#3B82F6' : '#10B981';
                                    return (
                                        <div key={range} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', color }}>{cnt}</div>
                                            <div style={{ width: '100%', height: pct === 0 ? 4 : `${pct}%`, background: color, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 0.5s ease' }}></div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{range}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right: Feedback Timeline */}
                <div style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ marginBottom: '1.25rem' }}>Feedback Timeline</h3>
                    {loading ? (
                        <div className="text-muted"><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Loading…</div>
                    ) : timeline.length === 0 ? (
                        <Card style={{ padding: '3rem', textAlign: 'center' }}>
                            <i className="fa-solid fa-hourglass-half" style={{ fontSize: '2.5rem', color: 'var(--border)', display: 'block', marginBottom: '0.75rem' }}></i>
                            <p className="text-muted">No reviewed tasks yet. Submit tasks to your team lead to get feedback.</p>
                            <Link to="/intern/workspace" style={{ textDecoration: 'none' }}>
                                <button style={{ marginTop: '0.75rem', padding: '0.625rem 1.25rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Go to Workspace</button>
                            </Link>
                        </Card>
                    ) : (
                        <div className="timeline">
                            {timeline.map(t => (
                                <div key={t.id} className="timeline-item">
                                    <div className="timeline-dot" style={{ background: scoreColor(t.score) }}></div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{formatDate(t.reviewed_at)}</div>
                                    <div className="timeline-content">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ padding: '0.2rem 0.6rem', background: t.status === 'done' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: t.status === 'done' ? '#10B981' : '#F59E0B', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
                                                {t.status === 'done' ? '✓ Approved' : 'Needs Revision'}
                                            </span>
                                            <DiffBadge level={t.difficulty} />
                                            <span style={{ fontWeight: 700, color: scoreColor(t.score), fontSize: '0.875rem' }}>{t.score}/100</span>
                                        </div>
                                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{t.title}</h4>
                                        {t.feedback && (
                                            <div style={{ padding: '0.75rem 1rem', background: `${scoreColor(t.score)}18`, borderRadius: '8px', fontSize: '0.875rem', color: scoreColor(t.score), fontStyle: 'italic', borderLeft: `3px solid ${scoreColor(t.score)}` }}>
                                                "{t.feedback}"
                                            </div>
                                        )}
                                        {t.status !== 'done' && (
                                            <Link to="/intern/workspace">
                                                <button style={{ marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }}>
                                                    Resubmit in Workspace
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InternPerformance;
