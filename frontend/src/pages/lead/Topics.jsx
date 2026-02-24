import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { getTasks, getTaskStats, createTask, updateTask, deleteTask } from '../../api/tasks';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` };
};

const DiffBadge = ({ level }) => {
    const cfg = { basic: { c: '#10B981', bg: 'rgba(16,185,129,0.12)', l: 'Basic' }, medium: { c: '#F59E0B', bg: 'rgba(245,158,11,0.12)', l: 'Medium' }, hard: { c: '#EF4444', bg: 'rgba(239,68,68,0.12)', l: 'Hard' } }[level] || { c: 'var(--text-muted)', bg: 'var(--bg-body)', l: level };
    return <span style={{ padding: '0.2rem 0.6rem', background: cfg.bg, color: cfg.c, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>{cfg.l}</span>;
};

const StatusBadge = ({ status }) => {
    const cfg = { todo: { c: 'var(--text-muted)', bg: 'var(--bg-body)', l: 'To Do' }, in_progress: { c: '#F59E0B', bg: 'rgba(245,158,11,0.12)', l: 'In Progress' }, done: { c: '#10B981', bg: 'rgba(16,185,129,0.12)', l: 'Done' } }[status] || { c: 'var(--text-muted)', bg: 'var(--bg-body)', l: status };
    return <span style={{ padding: '0.2rem 0.6rem', background: cfg.bg, color: cfg.c, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>{cfg.l}</span>;
};

const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const color = { success: '#10B981', error: '#EF4444', info: 'var(--primary)' }[type] || 'var(--primary)';
    return (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 2000, background: 'var(--bg-card)', border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-lg)', display: 'flex', gap: '0.75rem', minWidth: '280px', alignItems: 'center' }}>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
    );
};

const TaskModal = ({ task, onClose, onSaved, leadInterns }) => {
    const inp = { width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
    const [form, setForm] = useState({ title: task?.title || '', description: task?.description || '', difficulty: task?.difficulty || 'basic', assigned_to: task?.assigned_to || '', due_date: task?.due_date ? task.due_date.split('T')[0] : '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = async () => {
        if (!form.title.trim()) { setError('Title is required.'); return; }
        if (!form.assigned_to) { setError('Please select an intern.'); return; }
        setLoading(true); setError('');
        try { task ? await updateTask(task.id, form) : await createTask(form); onSaved(); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '100%', maxWidth: '520px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--gradient-primary)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: 'white' }}>{task ? 'Edit Task' : 'Create New Task'}</h3>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Title *</label>
                        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g., Implement Two Sum" style={inp} /></div>
                    <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Description</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe the task…" style={{ ...inp, resize: 'vertical' }} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Difficulty</label>
                            <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} style={inp}>
                                <option value="basic">Basic</option><option value="medium">Medium</option><option value="hard">Hard</option>
                            </select></div>
                        <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Due Date</label>
                            <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} style={inp} /></div>
                    </div>
                    <div><label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Assign To *</label>
                        {leadInterns.length === 0 ? (
                            <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', fontSize: '0.8125rem', color: '#EF4444' }}>
                                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.4rem' }}></i>
                                No interns assigned to you yet. Ask HR to assign interns to your account, then refresh this page.
                            </div>
                        ) : (
                            <select value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} style={inp}>
                                <option value="">— Select Intern —</option>
                                {leadInterns.map(i => <option key={i.id} value={i.id}>{i.name} ({i.email})</option>)}
                            </select>
                        )}
                    </div>
                    {error && <p style={{ color: '#EF4444', fontSize: '0.875rem', margin: 0 }}>{error}</p>}
                    <div className="flex gap-3 justify-end" style={{ marginTop: '0.5rem' }}>
                        <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>Cancel</button>
                        <button onClick={handleSave} disabled={loading} style={{ padding: '0.625rem 1.5rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeadTopics = () => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [leadInterns, setInterns] = useState([]);
    const [showModal, setModal] = useState(false);
    const [editTask, setEdit] = useState(null);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const showToast = (m, t = 'success') => setToast({ message: m, type: t });

    useEffect(() => {
        if (!user.id) return;
        // /hr/assignments/my-interns returns a plain array of the lead's interns
        fetch(`http://127.0.0.1:8000/api/hr/assignments/my-interns`, { headers: getAuthHeaders() })
            .then(async r => {
                if (!r.ok) {
                    const body = await r.text().catch(() => '');
                    console.error(`[myInterns] HTTP ${r.status}:`, body);
                    return [];
                }
                return r.json();
            })
            .then(d => {
                const arr = Array.isArray(d) ? d : [];
                console.log('[myInterns] loaded', arr.length, 'interns');
                setInterns(arr);
            })
            .catch(err => {
                console.error('[myInterns] network error:', err);
                setInterns([]);
            });
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.status = filter;
            if (search) params.search = search;
            const [t, s] = await Promise.all([getTasks(params), getTaskStats()]);
            setTasks(t); setStats(s);
        } catch { showToast('Failed to load tasks.', 'error'); }
        finally { setLoading(false); }
    }, [filter, search]);

    useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

    const handleDelete = async id => {
        setDeleting(id);
        try { await deleteTask(id); showToast('Task deleted.', 'info'); load(); }
        catch { showToast('Delete failed.', 'error'); }
        finally { setDeleting(null); }
    };

    const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <DashboardLayout role="Lead">
            <style>{`.tk-card { transition: all 0.2s; } .tk-card:hover { box-shadow: var(--shadow-lg) !important; transform: translateY(-2px); }`}</style>

            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 style={{ margin: 0 }}>Task Management</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>Create and assign tasks to your interns.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>
                    <Button variant="primary" onClick={() => { setEdit(null); setModal(true); }}>
                        <i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i> New Task
                    </Button>
                </div>
            </header>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[{ label: 'Total', value: stats.total, color: 'var(--primary)', icon: 'fa-list-check' }, { label: 'To Do', value: stats.todo, color: '#64748B', icon: 'fa-circle' }, { label: 'In Progress', value: stats.in_progress, color: '#F59E0B', icon: 'fa-spinner' }, { label: 'Done', value: stats.done, color: '#10B981', icon: 'fa-circle-check' }].map(c => (
                    <div key={c.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{c.label}</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: c.color, lineHeight: 1 }}>{loading ? '…' : (c.value ?? 0)}</div>
                        <i className={`fa-solid ${c.icon}`} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.75rem', color: c.color, opacity: 0.15 }}></i>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-5 flex-wrap items-center">
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                    <input type="text" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none' }} />
                </div>
                {['', 'todo', 'in_progress', 'done'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', background: filter === s ? 'var(--primary)' : 'var(--bg-body)', color: filter === s ? 'white' : 'var(--text-muted)' }}>
                        {s === '' ? 'All' : s === 'in_progress' ? 'In Progress' : s === 'todo' ? 'To Do' : 'Done'}
                    </button>
                ))}
            </div>

            {/* Cards */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i>Loading…</div>
            ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    <i className="fa-solid fa-list-check" style={{ fontSize: '3rem', color: 'var(--border)', display: 'block', marginBottom: '1rem' }}></i>
                    <p style={{ fontWeight: 600, marginBottom: '1.5rem' }}>No tasks yet</p>
                    <Button variant="primary" onClick={() => { setEdit(null); setModal(true); }}><i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i> Create Task</Button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
                    {tasks.map(task => (
                        <div key={task.id} className="tk-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
                            <div style={{ height: 4, background: task.difficulty === 'hard' ? '#EF4444' : task.difficulty === 'medium' ? '#F59E0B' : '#10B981' }} />
                            <div style={{ padding: '1.25rem' }}>
                                <div className="flex justify-between items-start mb-3">
                                    <div style={{ flex: 1, marginRight: '0.5rem' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.35rem', lineHeight: 1.3 }}>{task.title}</div>
                                        <div className="flex gap-2 flex-wrap"><DiffBadge level={task.difficulty} /><StatusBadge status={task.status} /></div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEdit(task); setModal(true); }} style={{ padding: '0.35rem 0.5rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}><i className="fa-solid fa-pen"></i></button>
                                        <button onClick={() => handleDelete(task.id)} disabled={deleting === task.id} style={{ padding: '0.35rem 0.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer', color: '#EF4444', fontSize: '0.8rem' }}><i className={`fa-solid ${deleting === task.id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i></button>
                                    </div>
                                </div>
                                {task.description && <p style={{ fontSize: '0.8375rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <div><i className="fa-solid fa-user" style={{ marginRight: '0.3rem' }}></i>{task.assignee?.name || '—'}</div>
                                    <div><i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }}></i>{formatDate(task.due_date)}</div>
                                </div>
                                {task.submission && !task.reviewed_at && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.45rem 0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '6px', fontSize: '0.78rem', color: '#F59E0B', fontWeight: 600 }}>
                                        <i className="fa-solid fa-clock" style={{ marginRight: '0.3rem' }}></i>Awaiting your review
                                    </div>
                                )}
                                {task.score !== null && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.45rem 0.75rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>
                                        <i className="fa-solid fa-star" style={{ marginRight: '0.3rem' }}></i>Reviewed — Score: {task.score}/100
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && <TaskModal task={editTask} leadInterns={leadInterns} onClose={() => { setModal(false); setEdit(null); }} onSaved={() => { setModal(false); setEdit(null); showToast(editTask ? 'Task updated!' : 'Task created!', 'success'); load(); }} />}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </DashboardLayout>
    );
};

export default LeadTopics;
