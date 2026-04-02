import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Link } from 'react-router-dom';
import { getTasks, getTaskStats, submitTask } from '../../api/tasks';

/* ── Difficulty badge ──────────────────────────────────────────────────── */
const DiffBadge = ({ level }) => {
    const cfg = {
        basic: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Basic' },
        medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Medium' },
        hard: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Hard' },
    }[level] || { color: 'var(--text-muted)', bg: 'var(--bg-body)', label: level };
    return (
        <span style={{ padding: '0.2rem 0.6rem', background: cfg.bg, color: cfg.color, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
            {cfg.label}
        </span>
    );
};

/* ── Status badge ──────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
    const cfg = {
        todo: { color: 'var(--text-muted)', bg: 'var(--bg-body)', label: 'To Do' },
        in_progress: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'In Progress' },
        done: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Done' },
    }[status] || { color: 'var(--text-muted)', bg: 'var(--bg-body)', label: status };
    return (
        <span style={{ padding: '0.2rem 0.6rem', background: cfg.bg, color: cfg.color, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>
            {cfg.label}
        </span>
    );
};

/* ── Toast ─────────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const color = { success: '#10B981', error: '#EF4444', info: 'var(--primary)' }[type] || 'var(--primary)';
    return (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 2000, background: 'var(--bg-card)', border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '280px' }}>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
    );
};

/* ── Submit Modal ──────────────────────────────────────────────────────── */
const SubmitModal = ({ task, onClose, onSubmitted }) => {
    const [code, setCode] = useState(task.submission || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isAlreadySubmitted = task.status !== 'todo';

    const handleSubmit = async () => {
        if (isAlreadySubmitted) {
            setError('This task has already been submitted. You cannot resubmit until it is reviewed by your team lead.');
            return;
        }
        if (!code.trim()) { setError('Please enter your solution.'); return; }
        setLoading(true);
        try {
            await submitTask(task.id, code);
            onSubmitted();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '100%', maxWidth: '680px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                {/* Header */}
                <div style={{ background: 'var(--gradient-primary)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1.125rem' }}>Submit Solution</h3>
                        <p style={{ margin: '0.2rem 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{task.title}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'white', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                </div>

                {/* Task description */}
                <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-body)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <DiffBadge level={task.difficulty} />
                    <StatusBadge status={task.status} />
                    {task.due_date && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                </div>

                {task.description && (
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {task.description}
                    </div>
                )}

                {/* Warning if already submitted */}
                {isAlreadySubmitted && (
                    <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{ color: '#F59E0B', marginTop: '0.2rem', flexShrink: 0 }}></i>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F59E0B' }}>Already Submitted</div>
                            <div style={{ fontSize: '0.8rem', color: '#F59E0B', opacity: 0.9 }}>This task has been submitted and is awaiting review. You cannot resubmit until the team lead reviews it.</div>
                        </div>
                    </div>
                )}

                {/* Code area */}
                <div style={{ flex: 1, padding: '1rem 1.5rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Your Solution / Answer{isAlreadySubmitted && ' (Read-only)'}</label>
                    <textarea
                        value={code}
                        onChange={e => !isAlreadySubmitted && setCode(e.target.value)}
                        disabled={isAlreadySubmitted}
                        placeholder="Paste your code or answer here..."
                        spellCheck={false}
                        style={{ flex: 1, minHeight: '220px', padding: '1rem', background: isAlreadySubmitted ? 'rgba(107,113,128,0.1)' : '#1E1E1E', color: isAlreadySubmitted ? 'rgba(107,113,128,0.6)' : '#D4D4D4', border: `1px solid ${isAlreadySubmitted ? 'rgba(107,113,128,0.2)' : '#333'}`, borderRadius: '8px', fontFamily: "'Fira Code','Consolas',monospace", fontSize: '0.875rem', lineHeight: 1.6, resize: 'vertical', outline: 'none', cursor: isAlreadySubmitted ? 'not-allowed' : 'text' }}
                    />
                    {error && <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</p>}
                </div>

                {/* Feedback (read-only if already reviewed) */}
                {task.feedback && (
                    <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(16,185,129,0.07)', borderTop: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600, marginBottom: '0.3rem' }}>
                            <i className="fa-solid fa-comment-dots" style={{ marginRight: '0.4rem' }}></i>
                            Team Lead Feedback {task.score !== null ? `— Score: ${task.score}/100` : ''}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)' }}>{task.feedback}</p>
                    </div>
                )}

                {/* Footer buttons */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '0.625rem 1.25rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>
                        {isAlreadySubmitted ? 'Close' : 'Cancel'}
                    </button>
                    <button onClick={handleSubmit} disabled={loading || isAlreadySubmitted} style={{ padding: '0.625rem 1.5rem', background: isAlreadySubmitted ? 'rgba(107,113,128,0.2)' : 'var(--gradient-primary)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isAlreadySubmitted || loading ? 'not-allowed' : 'pointer', color: isAlreadySubmitted ? 'rgba(107,113,128,0.6)' : 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: (loading || isAlreadySubmitted) ? 0.7 : 1 }}>
                        {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting…</> : isAlreadySubmitted ? <><i className="fa-solid fa-ban"></i> Cannot Resubmit</> : <><i className="fa-solid fa-paper-plane"></i> Submit</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Main Workspace ────────────────────────────────────────────────────── */
const InternWorkspace = () => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelected] = useState(null);
    const [submitTask_, setSubmit] = useState(null);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.status = filter;
            if (search) params.search = search;
            const [t, s] = await Promise.all([getTasks(params), getTaskStats()]);
            setTasks(t);
            setStats(s);
            if (selectedTask) {
                const fresh = t.find(x => x.id === selectedTask.id);
                if (fresh) setSelected(fresh);
            }
        } catch (e) {
            showToast('Failed to load tasks.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filter, search]);

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [load]);

    const formatDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const statCards = [
        { label: 'Total Tasks', value: stats.total, color: 'var(--primary)', icon: 'fa-list-check' },
        { label: 'To Do', value: stats.todo, color: '#64748B', icon: 'fa-circle' },
        { label: 'In Progress', value: stats.in_progress, color: '#F59E0B', icon: 'fa-spinner' },
        { label: 'Completed', value: stats.done, color: '#10B981', icon: 'fa-circle-check' },
    ];

    return (
        <DashboardLayout role="Intern">
            <style>{`
                .task-row:hover { background: var(--bg-body) !important; cursor: pointer; }
                @keyframes fadeIn { from{opacity:0} to{opacity:1} }
            `}</style>

            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 style={{ margin: 0 }}>My Workspace</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>View and submit your assigned tasks.</p>
                </div>
                <button onClick={load} style={{ padding: '0.5rem 1rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>
                    <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.4rem' }}></i> Refresh
                </button>
            </header>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {statCards.map(c => (
                    <div key={c.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{c.label}</div>
                        <div style={{ fontSize: '1.875rem', fontWeight: 800, color: c.color, lineHeight: 1 }}>{loading ? '…' : (c.value ?? 0)}</div>
                        <i className={`fa-solid ${c.icon}`} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.75rem', color: c.color, opacity: 0.15 }}></i>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap items-center">
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                    <input type="text" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none' }} />
                </div>
                {['', 'todo', 'in_progress', 'done'].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.15s',
                            background: filter === s ? 'var(--primary)' : 'var(--bg-body)',
                            color: filter === s ? 'white' : 'var(--text-muted)'
                        }}>
                        {s === '' ? 'All' : s === 'in_progress' ? 'In Progress' : s === 'todo' ? 'To Do' : 'Done'}
                    </button>
                ))}
            </div>

            {/* Task list */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 200px', gap: '1rem', padding: '0.875rem 1.5rem', background: 'var(--bg-body)', borderBottom: '1px solid var(--border)' }}>
                    {['Task', 'Difficulty', 'Status', 'Due Date', 'Actions'].map(h => (
                        <div key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i> Loading tasks…
                    </div>
                ) : tasks.length === 0 ? (
                    <div style={{ padding: '3.5rem', textAlign: 'center' }}>
                        <i className="fa-solid fa-inbox" style={{ fontSize: '3rem', color: 'var(--border)', display: 'block', marginBottom: '1rem' }}></i>
                        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No tasks found</p>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Your team lead hasn't assigned any tasks yet.</p>
                    </div>
                ) : tasks.map((task, idx) => (
                    <div key={task.id} className="task-row"
                        onClick={() => setSelected(task)}
                        style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 200px', gap: '1rem', padding: '1rem 1.5rem', alignItems: 'center', borderBottom: idx < tasks.length - 1 ? '1px solid var(--border)' : 'none', background: selectedTask?.id === task.id ? 'rgba(79,70,229,0.04)' : 'transparent', transition: 'background 0.15s' }}>
                        {/* Task name */}
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.15rem' }}>{task.title}</div>
                            {task.score !== null && <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Score: {task.score}/100</span>}
                        </div>
                        <DiffBadge level={task.difficulty} />
                        <StatusBadge status={task.status} />
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(task.due_date)}</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {/* Open in Editor */}
                            <Link
                                to={`/intern/editor/${task.id}`}
                                onClick={e => e.stopPropagation()}
                                style={{ padding: '0.4rem 0.65rem', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)', borderRadius: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                <i className="fa-solid fa-code"></i> IDE
                            </Link>
                            {/* Quick submit */}
                            <button onClick={e => { e.stopPropagation(); if (task.status === 'todo') setSubmit(task); }}
                                disabled={task.status !== 'todo'}
                                style={{ padding: '0.4rem 0.65rem', background: task.status === 'todo' ? 'var(--gradient-primary)' : 'rgba(107,113,128,0.2)', border: 'none', borderRadius: '6px', color: task.status === 'todo' ? 'white' : 'rgba(107,113,128,0.6)', fontWeight: 600, fontSize: '0.75rem', cursor: task.status === 'todo' ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', opacity: task.status === 'todo' ? 1 : 0.6 }}>
                                {task.status === 'in_progress' ? '⏳ Submitted' : task.status === 'done' ? '✓ Done' : 'Submit'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Side detail panel */}
            {selectedTask && (
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '380px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', zIndex: 900, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', animation: 'fadeIn 0.2s ease' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gradient-primary)' }}>
                        <h4 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>Task Details</h4>
                        <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: 'white', cursor: 'pointer' }}>✕</button>
                    </div>
                    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '0.75rem' }}>{selectedTask.title}</h3>
                        <div className="flex gap-2 flex-wrap mb-4">
                            <DiffBadge level={selectedTask.difficulty} />
                            <StatusBadge status={selectedTask.status} />
                        </div>
                        {selectedTask.description && <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.9rem' }}>{selectedTask.description}</p>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-body)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                            <div className="flex justify-between">
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned by</span>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selectedTask.creator?.name || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Due Date</span>
                                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{formatDate(selectedTask.due_date)}</span>
                            </div>
                            {selectedTask.score !== null && (
                                <div className="flex justify-between">
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Score</span>
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#10B981' }}>{selectedTask.score}/100</span>
                                </div>
                            )}
                        </div>
                        {selectedTask.feedback && (
                            <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#10B981', marginBottom: '0.5rem' }}>
                                    <i className="fa-solid fa-comment-dots" style={{ marginRight: '0.4rem' }}></i>Team Lead Feedback
                                </div>
                                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedTask.feedback}</p>
                            </div>
                        )}
                        {selectedTask.submission && (
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Your Last Submission</div>
                                <pre style={{ background: '#1E1E1E', color: '#D4D4D4', padding: '1rem', borderRadius: '8px', fontSize: '0.8125rem', overflowX: 'auto', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{selectedTask.submission}</pre>
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {/* Primary CTA: open in editor */}
                        <Link
                            to={`/intern/editor/${selectedTask.id}`}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9375rem', textDecoration: 'none', width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
                            <i className="fa-solid fa-code"></i> Open in Code Editor
                        </Link>
                        {/* Secondary: quick submit from textarea */}
                        <button onClick={() => { if (selectedTask.status === 'todo') { setSubmit(selectedTask); setSelected(null); } }}
                            disabled={selectedTask.status !== 'todo'}
                            style={{ width: '100%', padding: '0.625rem', background: selectedTask.status === 'todo' ? 'transparent' : 'rgba(107,113,128,0.1)', border: `1px solid ${selectedTask.status === 'todo' ? 'var(--border)' : 'rgba(107,113,128,0.3)'}`, borderRadius: '8px', color: selectedTask.status === 'todo' ? 'var(--text-main)' : 'rgba(107,113,128,0.6)', fontWeight: 600, cursor: selectedTask.status === 'todo' ? 'pointer' : 'not-allowed', fontSize: '0.875rem', opacity: selectedTask.status === 'todo' ? 1 : 0.6 }}>
                            <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.4rem' }}></i>
                            {selectedTask.status === 'in_progress' ? '⏳ Awaiting Review' : selectedTask.status === 'done' ? '✓ Already Reviewed' : 'Quick Submit (text)'}
                        </button>
                    </div>
                </div>
            )}

            {/* Submit modal */}
            {submitTask_ && (
                <SubmitModal
                    task={submitTask_}
                    onClose={() => setSubmit(null)}
                    onSubmitted={() => { setSubmit(null); showToast('Solution submitted!', 'success'); load(); }}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </DashboardLayout>
    );
};

export default InternWorkspace;
