import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { getTask, getTasks, reviewTask } from '../../api/tasks';

const DiffBadge = ({ level }) => {
    const cfg = { basic: { c: '#10B981', bg: 'rgba(16,185,129,0.12)', l: 'Basic' }, medium: { c: '#F59E0B', bg: 'rgba(245,158,11,0.12)', l: 'Medium' }, hard: { c: '#EF4444', bg: 'rgba(239,68,68,0.12)', l: 'Hard' } }[level] || { c: 'var(--text-muted)', bg: 'var(--bg-body)', l: level };
    return <span style={{ padding: '0.2rem 0.65rem', background: cfg.bg, color: cfg.c, borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{cfg.l}</span>;
};

const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const color = { success: '#10B981', error: '#EF4444' }[type] || 'var(--primary)';
    return (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 2000, background: 'var(--bg-card)', border: `1px solid ${color}`, borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-lg)', display: 'flex', gap: '0.75rem', minWidth: '280px', alignItems: 'center' }}>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>
    );
};

/* Pending submissions queue sidebar */
const PendingQueue = ({ tasks, selectedId, onSelect }) => (
    <div style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)', width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending Reviews <span style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', borderRadius: '999px', padding: '0.1rem 0.5rem', fontWeight: 800, marginLeft: '0.35rem' }}>{tasks.length}</span>
        </div>
        {tasks.length === 0 ? (
            <div style={{ padding: '2.5rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <i className="fa-solid fa-check-circle" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem', color: '#10B981' }}></i>
                All caught up!
            </div>
        ) : tasks.map(t => (
            <div key={t.id} onClick={() => onSelect(t.id)}
                style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedId === t.id ? 'rgba(79,70,229,0.06)' : 'transparent', borderLeft: selectedId === t.id ? '3px solid var(--primary)' : '3px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.3rem', lineHeight: 1.3 }}>{t.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <i className="fa-solid fa-user" style={{ fontSize: '0.7rem' }}></i>{t.assignee?.name || '—'}
                </div>
                <div style={{ marginTop: '0.4rem' }}><DiffBadge level={t.difficulty} /></div>
            </div>
        ))}
    </div>
);

/* ── Main Review Page ──────────────────────────────────────────────────── */
const LeadReview = () => {
    const navigate = useNavigate();
    const [pending, setPending] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loadingTask, setLT] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const showToast = (m, t = 'success') => setToast({ message: m, type: t });

    /* Load tasks with submissions that haven't been reviewed */
    const loadPending = async () => {
        try {
            const all = await getTasks({ status: 'in_progress' });
            setPending(all.filter(t => t.submission && !t.reviewed_at));
        } catch { showToast('Failed to load submissions.', 'error'); }
    };

    useEffect(() => { loadPending(); }, []);

    const selectTask = async (id) => {
        setLT(true);
        try {
            const t = await getTask(id);
            setSelected(t);
            setFeedback(t.feedback || '');
            setScore(t.score !== null ? String(t.score) : '');
        } catch { showToast('Failed to load task.', 'error'); }
        finally { setLT(false); }
    };

    const handleReview = async (status) => {
        if (!feedback.trim()) { showToast('Please add feedback before saving.', 'error'); return; }
        if (score === '' || isNaN(score) || score < 0 || score > 100) { showToast('Enter a valid score (0-100).', 'error'); return; }
        setSaving(true);
        try {
            await reviewTask(selected.id, { feedback, score: Number(score), status });
            showToast(`Review saved — ${status === 'done' ? 'Approved ✓' : 'Returned for revision'}`, 'success');
            setSelected(null);
            loadPending();
        } catch { showToast('Failed to save review.', 'error'); }
        finally { setSaving(false); }
    };

    const formatDate = d => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    /* Syntax-highlight lines for the code viewer */
    const CodeLine = ({ num, text }) => (
        <div style={{ display: 'flex', lineHeight: 1.65 }}>
            <div style={{ minWidth: 40, textAlign: 'right', paddingRight: '1rem', color: '#858585', userSelect: 'none', fontSize: '0.8rem' }}>{num}</div>
            <pre style={{ flex: 1, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#D4D4D4', fontSize: '0.85rem' }}>{text}</pre>
        </div>
    );

    return (
        <DashboardLayout role="Lead" fullWidth>
            {/* Full-height review workspace */}
            <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

                {/* Left: pending queue */}
                <PendingQueue tasks={pending} selectedId={selected?.id} onSelect={selectTask} />

                {/* Right: review area */}
                {!selected ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-code-branch" style={{ fontSize: '4rem', opacity: 0.2 }}></i>
                        <p style={{ fontWeight: 600, fontSize: '1.125rem', opacity: 0.5 }}>
                            {loadingTask ? 'Loading…' : pending.length === 0 ? 'No pending submissions' : 'Select a submission to review'}
                        </p>
                    </div>
                ) : loadingTask ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.2rem' }}>{selected.title}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <span>Submitted by <strong style={{ color: 'var(--text-main)' }}>{selected.assignee?.name}</strong></span>
                                    <span>•</span>
                                    <span>{formatDate(selected.submitted_at)}</span>
                                    <DiffBadge level={selected.difficulty} />
                                </div>
                            </div>
                            <span style={{ padding: '0.35rem 0.85rem', background: 'rgba(245,158,11,0.12)', color: '#F59E0B', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem' }}>
                                Pending Review
                            </span>
                        </div>

                        {/* Body: code + feedback panel */}
                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                            {/* Code viewer */}
                            <div style={{ flex: 1, background: '#1E1E1E', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ background: '#252526', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid #333' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
                                    <span style={{ marginLeft: '0.5rem', color: '#858585', fontSize: '0.8rem' }}>submission</span>
                                </div>
                                <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', fontFamily: "'Fira Code','Consolas', monospace" }}>
                                    {(selected.submission || '').split('\n').map((line, i) => (
                                        <CodeLine key={i} num={i + 1} text={line} />
                                    ))}
                                </div>
                            </div>

                            {/* Feedback panel */}
                            <div style={{ width: '340px', flexShrink: 0, background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <i className="fa-solid fa-comment-dots" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}></i> Evaluation
                                </div>

                                {/* Task description */}
                                {selected.description && (
                                    <div style={{ padding: '0.875rem 1.25rem', background: 'var(--bg-body)', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Desc</div>
                                        {selected.description}
                                    </div>
                                )}

                                <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Feedback</label>
                                        <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={7}
                                            placeholder="Write specific feedback…"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.4rem' }}>Score <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(0 – 100)</span></label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="number" min={0} max={100} value={score} onChange={e => setScore(e.target.value)}
                                                placeholder="e.g. 88"
                                                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
                                            <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>/100</span>
                                        </div>
                                        {score !== '' && (
                                            <div style={{ marginTop: '0.5rem', height: 6, background: 'var(--bg-body)', borderRadius: 4 }}>
                                                <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, Number(score)))}%`, background: Number(score) >= 70 ? '#10B981' : Number(score) >= 40 ? '#F59E0B' : '#EF4444', borderRadius: 4, transition: 'width 0.3s' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    <button onClick={() => handleReview('done')} disabled={saving}
                                        style={{ padding: '0.75rem', background: 'var(--gradient-primary)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check"></i>} Approve & Mark Done
                                    </button>
                                    <button onClick={() => handleReview('todo')} disabled={saving}
                                        style={{ padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                                        <i className="fa-solid fa-rotate-left"></i> Request Revision
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </DashboardLayout>
    );
};

export default LeadReview;
