import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import config from '../../config';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const apiFetch = async (url, opts = {}) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(url, { ...opts, headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, ...(opts.headers || {}) } });
    if (r.status === 401) { localStorage.removeItem('auth_token'); localStorage.removeItem('user'); window.location.href = '/auth/login'; return; }
    return r;
};
const initials = n => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';
const scoreColor = s => s >= 80 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444';

/* ── Toast ───────────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const color = type === 'success' ? '#10B981' : '#EF4444';
    return (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 2000, background: 'var(--bg-card)', border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-lg)', display: 'flex', gap: '0.75rem', minWidth: '280px', alignItems: 'center' }}>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
    );
};

/* ── Main Component ──────────────────────────────────────────────────────── */
const InternManagement = () => {
    const [interns, setInterns] = useState([]);
    const [pendingUsers, setPending] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);
    const showToast = (m, t = 'success') => setToast({ message: m, type: t });

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [statsR, pendingR, tasksR] = await Promise.all([
                apiFetch(`${config.API_BASE_URL}/me/stats`),
                apiFetch(`${config.API_BASE_URL}/hr/users`),
                apiFetch(`${config.API_BASE_URL}/tasks`),
            ]);
            if (statsR?.ok) {
                const d = await statsR.json();
                setInterns(d.interns || []);
            }
            if (pendingR?.ok) {
                const d = await pendingR.json();
                // /hr/users returns { users: [...] } or an array; filter by pending status
                const arr = Array.isArray(d) ? d : (d.users || []);
                setPending(arr.filter(u => u.status === 'pending'));
            }
            if (tasksR?.ok) setTasks(await tasksR.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    /* Normalize intern — attach computed task stats */
    const enrichedInterns = interns.map(intern => {
        const myTasks = tasks.filter(t => t.assigned_to === intern.id);
        const done = myTasks.filter(t => t.status === 'done').length;
        const inProgress = myTasks.filter(t => t.status === 'in_progress').length;
        const total = myTasks.length;
        const scores = myTasks.map(t => t.score).filter(s => s != null);
        const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
        return { ...intern, done, inProgress, total, avgScore };
    });

    const avgPerf = enrichedInterns.length
        ? Math.round(enrichedInterns.reduce((s, i) => s + (i.avgScore ?? 0), 0) / enrichedInterns.length)
        : 0;

    const filtered = enrichedInterns.filter(i => {
        const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase());
        if (!matchSearch) return false;
        if (filter === 'active') return i.is_active;
        if (filter === 'attention') return i.avgScore != null && i.avgScore < 60;
        return true;
    });

    const stats = {
        total: enrichedInterns.length,
        active: enrichedInterns.filter(i => i.is_active).length,
        attention: enrichedInterns.filter(i => i.avgScore != null && i.avgScore < 60).length,
        avgPerf,
    };

    /* Approve / Reject pending users */
    const handleAction = async (id, action) => {
        setActionLoading(id + action);
        try {
            const r = await apiFetch(`${config.API_BASE_URL}/hr/users/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action }),
            });
            if (r?.ok) {
                setPending(p => p.filter(u => u.id !== id));
                showToast(`User ${action === 'approved' ? 'approved' : 'rejected'} successfully.`);
                if (action === 'approved') load(); // refresh interns list
            } else {
                showToast('Action failed.', 'error');
            }
        } catch { showToast('Network error.', 'error'); }
        finally { setActionLoading(null); }
    };

    const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <DashboardLayout role="Lead">
            {/* Header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ margin: 0, marginBottom: '0.25rem' }}>👥 Intern Management</h1>
                        <p className="text-muted" style={{ margin: 0 }}>Monitor and manage your intern team</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <i className="fa-solid fa-rotate-right"></i>
                        </button>
                        <Link to="/lead/topics" style={{ textDecoration: 'none' }}>
                            <Button variant="primary"><i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i>Assign Task</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Pending Approvals */}
            {pendingUsers.length > 0 && (
                <div style={{ marginBottom: '1.75rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>
                        <i className="fa-solid fa-user-clock" style={{ marginRight: '0.5rem', color: '#F59E0B' }}></i>
                        Pending Approvals <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.85rem', fontWeight: 800, marginLeft: '0.35rem' }}>{pendingUsers.length}</span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                        {pendingUsers.map(u => (
                            <Card key={u.id} style={{ padding: '1.25rem', borderLeft: '4px solid #F59E0B' }}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                                            <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>{initials(u.name)}</div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{u.name}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                            <span style={{ padding: '0.15rem 0.5rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>{u.role?.name || 'Intern'}</span>
                                            {u.technology && <span style={{ padding: '0.15rem 0.5rem', background: 'rgba(79,70,229,0.1)', color: 'var(--primary)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>{u.technology.name}</span>}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Registered: {new Date(u.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                                    <button disabled={actionLoading === u.id + 'approved'} onClick={() => handleAction(u.id, 'approved')}
                                        style={{ flex: 1, padding: '0.5rem', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        {actionLoading === u.id + 'approved' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>} Approve
                                    </button>
                                    <button disabled={actionLoading === u.id + 'rejected'} onClick={() => handleAction(u.id, 'rejected')}
                                        style={{ flex: 1, padding: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        {actionLoading === u.id + 'rejected' ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-times"></i>} Reject
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                    { label: 'Total Interns', value: stats.total, color: 'var(--primary)', icon: 'fa-users' },
                    { label: 'Active', value: stats.active, color: '#10B981', icon: 'fa-user-check' },
                    { label: 'Needs Attention', value: stats.attention, color: '#EF4444', icon: 'fa-triangle-exclamation' },
                    { label: 'Avg Score', value: stats.avgPerf ? `${stats.avgPerf}` : 'N/A', color: '#F59E0B', icon: 'fa-chart-line' },
                ].map(c => (
                    <Card key={c.label} style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{c.label}</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: c.color, lineHeight: 1 }}>{loading ? '…' : c.value}</div>
                        <i className={`fa-solid ${c.icon}`} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '2rem', color: c.color, opacity: 0.12 }}></i>
                    </Card>
                ))}
            </div>

            {/* Filters + Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="flex gap-2">
                    {[['all', 'All'], ['active', 'Active'], ['attention', 'Needs Attention']].map(([k, l]) => (
                        <button key={k} onClick={() => setFilter(k)}
                            style={{ padding: '0.4rem 0.9rem', borderRadius: '999px', border: '1px solid var(--border)', background: filter === k ? 'var(--primary)' : 'var(--bg-card)', color: filter === k ? 'white' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                            {l} {k === 'all' ? `(${stats.total})` : k === 'active' ? `(${stats.active})` : `(${stats.attention})`}
                        </button>
                    ))}
                </div>
                <div style={{ position: 'relative' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}></i>
                    <input type="text" placeholder="Search interns…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ padding: '0.5rem 0.75rem 0.5rem 2rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none', width: '220px' }} />
                </div>
            </div>

            {/* Intern Cards */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}></i>Loading interns from database…
                </div>
            ) : filtered.length === 0 ? (
                <Card style={{ padding: '4rem', textAlign: 'center' }}>
                    <i className="fa-solid fa-users" style={{ fontSize: '3rem', color: 'var(--border)', display: 'block', marginBottom: '1rem' }}></i>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                        {interns.length === 0 ? 'No interns assigned to you yet' : 'No interns match the current filter'}
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>HR assigns interns to team leads. Contact your HR manager.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                    {filtered.map(intern => {
                        const isLow = intern.avgScore != null && intern.avgScore < stats.avgPerf;
                        const isExpanded = selected === intern.id;
                        const internTasks = tasks.filter(t => t.assigned_to === intern.id);

                        return (
                            <Card key={intern.id}
                                onClick={() => setSelected(isExpanded ? null : intern.id)}
                                style={{
                                    padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                                    borderTop: `4px solid ${isLow ? '#EF4444' : intern.is_active ? '#10B981' : 'var(--border)'}`,
                                    display: 'flex', flexDirection: 'column', gap: '1rem',
                                    boxShadow: isExpanded ? 'var(--shadow-lg)' : undefined,
                                }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>{initials(intern.name)}</div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{intern.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{intern.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                                        <span style={{ padding: '0.15rem 0.5rem', background: intern.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: intern.is_active ? '#10B981' : '#F59E0B', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>{intern.is_active ? 'Active' : 'Pending'}</span>
                                        {isLow && <span style={{ padding: '0.15rem 0.5rem', background: 'rgba(239,68,68,0.12)', color: '#EF4444', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>⚠ Low</span>}
                                    </div>
                                </div>

                                {/* Technology */}
                                {intern.technology?.name && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'rgba(79,70,229,0.08)', padding: '0.25rem 0.65rem', borderRadius: '999px', width: 'fit-content', fontWeight: 600 }}>
                                        <i className="fa-solid fa-microchip" style={{ marginRight: '0.3rem' }}></i>{intern.technology.name}
                                    </div>
                                )}

                                {/* Avg Score bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Avg Score</span>
                                        <span style={{ fontWeight: 700, color: intern.avgScore != null ? scoreColor(intern.avgScore) : 'var(--text-muted)' }}>
                                            {intern.avgScore != null ? `${intern.avgScore}/100` : 'No reviews'}
                                        </span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-body)', borderRadius: 3 }}>
                                        <div style={{ height: '100%', width: `${intern.avgScore ?? 0}%`, background: intern.avgScore != null ? scoreColor(intern.avgScore) : 'var(--border)', borderRadius: 3, transition: 'width 0.5s ease' }}></div>
                                    </div>
                                </div>

                                {/* Task mini stats */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: 'var(--bg-body)', borderRadius: '8px', padding: '0.75rem' }}>
                                    {[
                                        { label: 'Total', value: intern.total, color: 'var(--text-main)' },
                                        { label: 'Active', value: intern.inProgress, color: '#F59E0B' },
                                        { label: 'Done', value: intern.done, color: '#10B981' },
                                    ].map(s => (
                                        <div key={s.label} style={{ textAlign: 'center' }}>
                                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer / expand toggle */}
                                {!isExpanded && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                        <span>Joined {formatDate(intern.assigned_at)}</span>
                                        <i className="fa-solid fa-chevron-down"></i>
                                    </div>
                                )}

                                {/* Expanded: recent tasks */}
                                {isExpanded && (
                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Recent Tasks</div>
                                        {internTasks.length === 0 ? (
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No tasks assigned yet.</p>
                                        ) : internTasks.slice(0, 3).map(t => (
                                            <div key={t.id} style={{ padding: '0.625rem 0.875rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                                                    <span style={{ padding: '0.1rem 0.45rem', background: t.status === 'done' ? 'rgba(16,185,129,0.12)' : t.status === 'in_progress' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)', color: t.status === 'done' ? '#10B981' : t.status === 'in_progress' ? '#F59E0B' : 'var(--primary)', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, flexShrink: 0 }}>
                                                        {t.status === 'done' ? 'Done' : t.status === 'in_progress' ? 'Active' : 'Todo'}
                                                    </span>
                                                </div>
                                                {t.score != null && (
                                                    <div style={{ fontSize: '0.75rem', color: scoreColor(t.score), marginTop: '0.25rem', fontWeight: 700 }}>Score: {t.score}/100</div>
                                                )}
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <Link to="/lead/topics" style={{ textDecoration: 'none', flex: 1 }}>
                                                <button onClick={e => e.stopPropagation()} style={{ width: '100%', padding: '0.5rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                                                    <i className="fa-solid fa-plus" style={{ marginRight: '0.3rem' }}></i>Assign Task
                                                </button>
                                            </Link>
                                            <Link to="/lead/review" style={{ textDecoration: 'none', flex: 1 }}>
                                                <button onClick={e => e.stopPropagation()} style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                                                    <i className="fa-solid fa-check-double" style={{ marginRight: '0.3rem' }}></i>Reviews
                                                </button>
                                            </Link>
                                        </div>
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                            <i className="fa-solid fa-chevron-up"></i>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </DashboardLayout>
    );
};

export default InternManagement;
