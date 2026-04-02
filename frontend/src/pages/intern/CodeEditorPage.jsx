import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getTask, submitTask } from '../../api/tasks';
import config from '../../config';

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────────────────── */
const apiFetch = async (url, opts = {}) => {
    const token = localStorage.getItem('auth_token');
    const r = await fetch(url, {
        ...opts,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(opts.headers || {}) },
    });
    if (r.status === 401) { localStorage.removeItem('auth_token'); localStorage.removeItem('user'); window.location.href = '/auth/login'; return null; }
    return r;
};

const LANGUAGES = [
    { id: 'javascript', label: 'JavaScript', ext: '.js', monacoLang: 'javascript', starter: '// JavaScript\nconsole.log("Hello, World!");\n' },
    { id: 'python', label: 'Python', ext: '.py', monacoLang: 'python', starter: '# Python\nprint("Hello, World!")\n' },
    { id: 'php', label: 'PHP', ext: '.php', monacoLang: 'php', starter: '<?php\necho "Hello, World!";\n' },
    { id: 'java', label: 'Java', ext: '.java', monacoLang: 'java', starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n' },
    { id: 'c', label: 'C', ext: '.c', monacoLang: 'c', starter: '#include <stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n' },
    { id: 'cpp', label: 'C++', ext: '.cpp', monacoLang: 'cpp', starter: '#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n' },
    { id: 'typescript', label: 'TypeScript', ext: '.ts', monacoLang: 'typescript', starter: 'const msg: string = "Hello, World!";\nconsole.log(msg);\n' },
    { id: 'go', label: 'Go', ext: '.go', monacoLang: 'go', starter: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n' },
    { id: 'bash', label: 'Bash', ext: '.sh', monacoLang: 'shell', starter: '#!/bin/bash\necho "Hello, World!"\n' },
    { id: 'sql', label: 'SQL', ext: '.sql', monacoLang: 'sql', starter: '-- SQL (SQLite)\nCREATE TABLE users (\n    id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    email TEXT UNIQUE\n);\n\nINSERT INTO users (name, email) VALUES ("Alice", "alice@example.com");\nSELECT * FROM users;\n' },
];

const DiffBadge = ({ level }) => {
    const cfg = { basic: { c: '#10B981', bg: 'rgba(16,185,129,0.15)' }, medium: { c: '#F59E0B', bg: 'rgba(245,158,11,0.15)' }, hard: { c: '#EF4444', bg: 'rgba(239,68,68,0.15)' } }[level] || { c: '#6B7280', bg: 'rgba(107,114,128,0.15)' };
    return <span style={{ padding: '0.15rem 0.5rem', background: cfg.bg, color: cfg.c, borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}>{level}</span>;
};

/* ─────────────────────────────────────────────────────────────────────────────
   Activity Tracker hook
───────────────────────────────────────────────────────────────────────────── */
const useActivityTracker = (taskId) => {
    const events = useRef([]);
    const keyCount = useRef(0);

    const log = useCallback((action, meta = {}) => {
        events.current.push({ action, timestamp: new Date().toISOString(), ...meta });
    }, []);

    const trackKeydown = useCallback(() => {
        keyCount.current++;
        if (keyCount.current % 50 === 0) {
            log('typing', { keystrokes: keyCount.current });
        }
    }, [log]);

    return { log, trackKeydown, keyCount };
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Code Editor Page
───────────────────────────────────────────────────────────────────────────── */
const CodeEditorPage = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();

    // ── State ───────────────────────────────────────────────────────────────
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState(LANGUAGES[0]);
    const [code, setCode] = useState(LANGUAGES[0].starter);
    const [output, setOutput] = useState('');
    const [outputErr, setOutputErr] = useState('');
    const [running, setRunning] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [bottomPanel, setBottomPanel] = useState('output'); // output | problem | stdin
    const [stdin, setStdin] = useState('');
    const [toast, setToast] = useState(null);
    const [theme, setTheme] = useState('vs-dark');
    const [fontSize, setFontSize] = useState(14);
    const [panelH, setPanelH] = useState(220);
    const [wordWrap, setWordWrap] = useState('off');

    // ── Copy-paste detection ────────────────────────────────────────────────
    const pasteAttempts = useRef([]);
    const [pasteCount, setPasteCount] = useState(0);

    const autoSaveTimer = useRef(null);
    const editorRef = useRef(null);
    const { log, trackKeydown } = useActivityTracker(taskId);

    const showToast = (msg, type = 'success') => setToast({ msg, type });

    // ── Load task ───────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const t = await getTask(taskId);
                setTask(t);
                // Restore draft if available
                if (t.draft_code) {
                    setCode(t.draft_code);
                    const savedLang = LANGUAGES.find(l => l.id === t.draft_language) || LANGUAGES[0];
                    setLang(savedLang);
                    setSavedAt(t.draft_saved_at ? new Date(t.draft_saved_at) : null);
                } else if (t.submission) {
                    setCode(t.submission);
                }
            } catch { showToast('Failed to load task.', 'error'); }
            finally { setLoading(false); }
        })();
    }, [taskId]);

    // ── Security: copy-paste detection & drag-drop prevention ────────────
    useEffect(() => {
        const handlePaste = (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData?.getData('text') || '';
            const attempt = {
                timestamp: new Date().toISOString(),
                textLength: pastedText.length,
                preview: pastedText.substring(0, 80) + (pastedText.length > 80 ? '…' : ''),
            };
            pasteAttempts.current.push(attempt);
            setPasteCount(c => {
                const newCount = c + 1;
                
                // Alert HR and Team Lead if paste count reaches 10
                if (newCount === 10) {
                    const token = localStorage.getItem('auth_token');
                    fetch(`${config.API_BASE_URL}/report-copy-paste`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            task_id: taskId,
                            paste_count: newCount,
                        }),
                    }).catch(err => console.error('Failed to report copy-paste:', err));
                }
                
                return newCount;
            });
            log('paste_attempt', { textLength: pastedText.length });
            showToast(`⚠ Paste blocked! Attempt #${pasteAttempts.current.length} recorded.`, 'error');
        };

        const handleCopy = (e) => {
            // Allow internal copy (e.g., within the editor) but log it
            log('copy', { timestamp: new Date().toISOString() });
        };

        const preventDrop = (e) => {
            e.preventDefault();
            showToast('Drag & drop is disabled.', 'warn');
        };

        // Capture context menu to prevent right-click paste
        const preventContextMenu = (e) => {
            const editorEl = document.querySelector('.monaco-editor');
            if (editorEl && editorEl.contains(e.target)) {
                e.preventDefault();
            }
        };

        document.addEventListener('paste', handlePaste, true);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('drop', preventDrop, true);
        document.addEventListener('dragover', (e) => e.preventDefault(), true);
        document.addEventListener('contextmenu', preventContextMenu);

        return () => {
            document.removeEventListener('paste', handlePaste, true);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('drop', preventDrop, true);
            document.removeEventListener('contextmenu', preventContextMenu);
        };
    }, [log]);

    // ── Auto-save every 30s ─────────────────────────────────────────────────
    useEffect(() => {
        if (!task) return;
        if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
        autoSaveTimer.current = setInterval(() => { doAutoSave(code); }, 30000);
        return () => clearInterval(autoSaveTimer.current);
    }, [task, code, lang]);

    const doAutoSave = useCallback(async (currentCode) => {
        if (!task || !currentCode.trim()) return;
        setSaving(true);
        try {
            await apiFetch(`${config.API_BASE_URL}/code/autosave`, {
                method: 'POST',
                body: JSON.stringify({ task_id: task.id, code: currentCode, language: lang.id }),
            });
            setSavedAt(new Date());
            log('autosave');
        } catch { }
        finally { setSaving(false); }
    }, [task, lang, log]);

    // ── Run code ────────────────────────────────────────────────────────────
    const handleRun = async () => {
        if (!code.trim()) return;
        setRunning(true);
        setOutput(''); setOutputErr('');
        setBottomPanel('output');
        log('run', { language: lang.id });
        try {
            const r = await apiFetch(`${config.API_BASE_URL}/code/run`, {
                method: 'POST',
                body: JSON.stringify({ language: lang.id, code, stdin, task_id: task?.id }),
            });
            if (!r) return;
            const data = await r.json();
            setOutput(data.output || '');
            setOutputErr(data.error || '');
            if (!data.success && data.error) showToast('Code ran with errors.', 'error');
            else showToast('Ran successfully ✓', 'success');
        } catch (e) {
            setOutputErr('Network error — could not reach execution service.');
            showToast('Execution failed.', 'error');
        } finally { setRunning(false); }
    };

    // ── Manual save ─────────────────────────────────────────────────────────
    const handleSave = () => { doAutoSave(code); showToast('Saved ✓', 'success'); };

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!code.trim()) { showToast('Write some code first!', 'error'); return; }
        setSubmitting(true);
        log('submit');
        try {
            await submitTask(task.id, code);
            showToast('Solution submitted! 🎉', 'success');
            setShowSubmit(false);
            setTimeout(() => navigate('/intern/workspace'), 1500);
        } catch (e) {
            showToast(e.message || 'Submission failed.', 'error');
        } finally { setSubmitting(false); }
    };

    // ── Language change ─────────────────────────────────────────────────────
    const handleLangChange = (id) => {
        const next = LANGUAGES.find(l => l.id === id);
        if (!next) return;
        setLang(next);
        setCode(next.starter);
        setOutput(''); setOutputErr('');
    };

    // ── Key bindings ─────────────────────────────────────────────────────────
    const handleEditorMount = (editor) => {
        editorRef.current = editor;
        editor.addCommand(
            // Ctrl+S / Cmd+S → save
            monaco => monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => handleSave()
        );
        editor.addCommand(
            // Ctrl+Enter / Cmd+Enter → run
            monaco => monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => handleRun()
        );
        editor.onKeyDown(trackKeydown);
    };

    const formatTime = dt => {
        if (!dt) return null;
        return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    // ── Colours ──────────────────────────────────────────────────────────────
    const DARK_BG = '#0d1117';
    const PANEL_BG = '#161b22';
    const BAR_BG = '#1c2128';
    const BORDER_C = '#30363d';
    const TEXT_MAIN = '#e6edf3';
    const TEXT_MUTED = '#8b949e';
    const PRIMARY = '#4f46e5';

    // ── Loading / Error ──────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ height: '100vh', background: DARK_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_MUTED }}>
            <div style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: PRIMARY, display: 'block', marginBottom: '1rem' }}></i>
                <p>Loading workspace…</p>
            </div>
        </div>
    );

    if (!task) return (
        <div style={{ height: '100vh', background: DARK_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEXT_MUTED }}>
            <div style={{ textAlign: 'center' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '3rem', color: '#EF4444', display: 'block', marginBottom: '1rem' }}></i>
                <p>Task not found.</p>
                <Link to="/intern/workspace" style={{ color: PRIMARY, marginTop: '0.5rem', display: 'inline-block' }}>← Back to workspace</Link>
            </div>
        </div>
    );

    const diffColor = { basic: '#10B981', medium: '#F59E0B', hard: '#EF4444' }[task.difficulty] || '#6B7280';

    return (
        <div style={{ height: '100vh', background: DARK_BG, display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", color: TEXT_MAIN, overflow: 'hidden' }}>

            {/* ── TOP BAR ────────────────────────────────────────────────────── */}
            <div style={{ height: 48, background: BAR_BG, borderBottom: `1px solid ${BORDER_C}`, display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.75rem', flexShrink: 0, zIndex: 100 }}>
                {/* Back */}
                <Link to="/intern/workspace" style={{ color: TEXT_MUTED, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.3rem 0.6rem', borderRadius: '6px', border: `1px solid ${BORDER_C}` }}>
                    <i className="fa-solid fa-arrow-left"></i> Back
                </Link>

                <div style={{ width: 1, height: 20, background: BORDER_C }}></div>

                {/* Task badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: diffColor, flexShrink: 0 }}></div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>{task.title}</span>
                    <DiffBadge level={task.difficulty} />
                </div>

                <div style={{ flex: 1 }}></div>

                {/* Language selector */}
                <select value={lang.id} onChange={e => handleLangChange(e.target.value)}
                    style={{ background: PANEL_BG, border: `1px solid ${BORDER_C}`, borderRadius: '6px', color: TEXT_MAIN, padding: '0.3rem 0.6rem', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}>
                    {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>

                {/* Theme toggle */}
                <button onClick={() => setTheme(t => t === 'vs-dark' ? 'light' : 'vs-dark')}
                    title="Toggle theme"
                    style={{ background: PANEL_BG, border: `1px solid ${BORDER_C}`, borderRadius: '6px', color: TEXT_MUTED, padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <i className={`fa-solid ${theme === 'vs-dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>

                {/* Font size */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', border: `1px solid ${BORDER_C}`, borderRadius: '6px', overflow: 'hidden' }}>
                    <button onClick={() => setFontSize(f => Math.max(10, f - 1))} style={{ background: PANEL_BG, border: 'none', color: TEXT_MUTED, padding: '0.35rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>A-</button>
                    <span style={{ fontSize: '0.75rem', color: TEXT_MUTED, minWidth: '1.5rem', textAlign: 'center' }}>{fontSize}</span>
                    <button onClick={() => setFontSize(f => Math.min(24, f + 1))} style={{ background: PANEL_BG, border: 'none', color: TEXT_MUTED, padding: '0.35rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>A+</button>
                </div>

                <div style={{ width: 1, height: 20, background: BORDER_C }}></div>

                {/* Save indicator */}
                <div style={{ fontSize: '0.75rem', color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: '0.3rem', minWidth: '110px' }}>
                    {saving ? (
                        <><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '0.65rem' }}></i> Saving…</>
                    ) : savedAt ? (
                        <><i className="fa-solid fa-check" style={{ color: '#10B981', fontSize: '0.65rem' }}></i> Saved {formatTime(savedAt)}</>
                    ) : <><i className="fa-regular fa-floppy-disk" style={{ fontSize: '0.65rem' }}></i> Not saved</>}
                </div>

                {/* Save */}
                <button onClick={handleSave}
                    title="Save (Ctrl+S)"
                    style={{ background: PANEL_BG, border: `1px solid ${BORDER_C}`, borderRadius: '6px', color: TEXT_MUTED, padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <i className="fa-regular fa-floppy-disk"></i> Save
                </button>

                {/* Run */}
                <button onClick={handleRun} disabled={running}
                    title="Run (Ctrl+Enter)"
                    style={{ background: running ? '#1a3a1a' : '#16a34a', border: `1px solid ${running ? '#2d5a2d' : '#15803d'}`, borderRadius: '6px', color: 'white', padding: '0.35rem 1rem', cursor: running ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.15s' }}>
                    {running ? <><i className="fa-solid fa-spinner fa-spin"></i> Running…</> : <><i className="fa-solid fa-play"></i> Run</>}
                </button>

                {/* Submit */}
                <button onClick={() => setShowSubmit(true)}
                    style={{ background: 'var(--gradient-primary, linear-gradient(135deg,#4f46e5,#7c3aed))', border: 'none', borderRadius: '6px', color: 'white', padding: '0.35rem 1rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <i className="fa-solid fa-paper-plane"></i> Submit
                </button>
            </div>

            {/* ── MAIN BODY ──────────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* ── LEFT SIDEBAR — Task details ─────────────────────────────── */}
                <div style={{ width: 280, flexShrink: 0, background: PANEL_BG, borderRight: `1px solid ${BORDER_C}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    {/* Problem description */}
                    <div style={{ padding: '1rem', borderBottom: `1px solid ${BORDER_C}` }}>
                        <div style={{ fontSize: '0.7rem', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '0.5rem' }}>Problem</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.4, marginBottom: '0.5rem' }}>{task.title}</div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                            <DiffBadge level={task.difficulty} />
                            <span style={{ padding: '0.15rem 0.5rem', background: task.status === 'done' ? 'rgba(16,185,129,0.15)' : task.status === 'in_progress' ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)', color: task.status === 'done' ? '#10B981' : task.status === 'in_progress' ? '#F59E0B' : '#6B7280', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700 }}>
                                {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                            </span>
                        </div>
                        {task.due_date && (
                            <div style={{ fontSize: '0.78rem', color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <i className="fa-regular fa-calendar"></i>
                                Due: {new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                        )}
                    </div>

                    {task.description && (
                        <div style={{ padding: '1rem', borderBottom: `1px solid ${BORDER_C}` }}>
                            <div style={{ fontSize: '0.7rem', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '0.5rem' }}>Description</div>
                            <p style={{ fontSize: '0.8375rem', color: '#8b949e', lineHeight: 1.7, margin: 0 }}>{task.description}</p>
                        </div>
                    )}

                    {/* Assigned by */}
                    {task.creator && (
                        <div style={{ padding: '1rem', borderBottom: `1px solid ${BORDER_C}` }}>
                            <div style={{ fontSize: '0.7rem', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '0.5rem' }}>Assigned By</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
                                    {task.creator.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <div style={{ fontSize: '0.8125rem' }}>{task.creator.name}</div>
                            </div>
                        </div>
                    )}

                    {/* Feedback (if reviewed) */}
                    {task.feedback && (
                        <div style={{ padding: '1rem', borderBottom: `1px solid ${BORDER_C}` }}>
                            <div style={{ fontSize: '0.7rem', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '0.5rem' }}>Feedback</div>
                            {task.score != null && (
                                <div style={{ fontWeight: 800, fontSize: '1.5rem', color: task.score >= 70 ? '#10B981' : task.score >= 40 ? '#F59E0B' : '#EF4444', marginBottom: '0.4rem' }}>{task.score}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: TEXT_MUTED }}>/100</span></div>
                            )}
                            <p style={{ fontSize: '0.8125rem', color: TEXT_MUTED, lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>"{task.feedback}"</p>
                        </div>
                    )}

                    {/* Keyboard shortcuts */}
                    <div style={{ padding: '1rem', marginTop: 'auto' }}>
                        <div style={{ fontSize: '0.7rem', color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: '0.5rem' }}>Shortcuts</div>
                        {[['Ctrl+Enter', 'Run code'], ['Ctrl+S', 'Save draft'], ['Ctrl+Z', 'Undo'], ['Ctrl+/', 'Toggle comment']].map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                                <span style={{ color: TEXT_MUTED }}>{v}</span>
                                <kbd style={{ background: BAR_BG, border: `1px solid ${BORDER_C}`, borderRadius: '4px', padding: '0.1rem 0.35rem', fontSize: '0.68rem', color: TEXT_MAIN, fontFamily: 'monospace' }}>{k}</kbd>
                            </div>
                        ))}
                    </div>

                    {/* Security notice */}
                    <div style={{ margin: '0 1rem 1rem', padding: '0.75rem', background: pasteCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.07)', border: `1px solid ${pasteCount > 0 ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.2)'}`, borderRadius: '8px', fontSize: '0.72rem', color: '#f87171', lineHeight: 1.5, transition: 'all 0.3s' }}>
                        <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.4rem' }}></i>
                        Paste, drag-drop &amp; right-click disabled. All work must be typed directly.
                        {pasteCount > 0 && (
                            <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(239,68,68,0.2)', borderRadius: '6px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                {pasteCount} paste attempt{pasteCount > 1 ? 's' : ''} detected &amp; logged
                            </div>
                        )}
                    </div>
                </div>

                {/* ── EDITOR + OUTPUT ─────────────────────────────────────────── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* Monaco Editor */}
                    <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                        <Editor
                            theme={theme}
                            language={lang.monacoLang}
                            value={code}
                            onChange={v => setCode(v || '')}
                            onMount={handleEditorMount}
                            options={{
                                fontSize,
                                fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
                                fontLigatures: true,
                                lineNumbers: 'on',
                                minimap: { enabled: false },
                                wordWrap,
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                tabSize: 4,
                                insertSpaces: true,
                                suggestOnTriggerCharacters: true,
                                bracketPairColorization: { enabled: true },
                                cursorBlinking: 'phase',
                                renderLineHighlight: 'line',
                                smoothScrolling: true,
                                padding: { top: 12, bottom: 12 },
                            }}
                        />
                        {/* Word wrap toggle */}
                        <button onClick={() => setWordWrap(w => w === 'off' ? 'on' : 'off')}
                            title="Toggle word wrap"
                            style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: BAR_BG, border: `1px solid ${BORDER_C}`, borderRadius: '6px', color: wordWrap === 'on' ? PRIMARY : TEXT_MUTED, padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem', opacity: 0.8 }}>
                            <i className="fa-solid fa-text-width"></i>
                        </button>
                    </div>

                    {/* ── BOTTOM PANEL ────────────────────────────────────────── */}
                    <div style={{ height: panelH, flexShrink: 0, background: PANEL_BG, borderTop: `1px solid ${BORDER_C}`, display: 'flex', flexDirection: 'column' }}>
                        {/* Panel tabs + resize */}
                        <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${BORDER_C}`, userSelect: 'none' }}>
                            {[['output', 'fa-terminal', 'Output'], ['stdin', 'fa-keyboard', 'Stdin'], ['problem', 'fa-book-open', 'Problem']].map(([id, icon, label]) => (
                                <button key={id} onClick={() => setBottomPanel(id)}
                                    style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: bottomPanel === id ? `2px solid ${PRIMARY}` : '2px solid transparent', color: bottomPanel === id ? PRIMARY : TEXT_MUTED, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: bottomPanel === id ? 700 : 400 }}>
                                    <i className={`fa-solid ${icon}`} style={{ fontSize: '0.7rem' }}></i>{label}
                                </button>
                            ))}
                            <div style={{ flex: 1 }}></div>
                            <div style={{ display: 'flex', gap: '0.5rem', padding: '0 0.75rem', alignItems: 'center' }}>
                                <button onClick={() => setPanelH(h => Math.min(500, h + 60))} style={{ background: 'none', border: 'none', color: TEXT_MUTED, cursor: 'pointer', fontSize: '0.75rem' }}><i className="fa-solid fa-chevron-up"></i></button>
                                <button onClick={() => setPanelH(h => Math.max(100, h - 60))} style={{ background: 'none', border: 'none', color: TEXT_MUTED, cursor: 'pointer', fontSize: '0.75rem' }}><i className="fa-solid fa-chevron-down"></i></button>
                            </div>
                        </div>

                        {/* Panel content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', fontFamily: "'Fira Code','Consolas',monospace", fontSize: '0.85rem' }}>
                            {bottomPanel === 'output' && (
                                <div>
                                    {!output && !outputErr && !running && (
                                        <div style={{ color: TEXT_MUTED, fontStyle: 'italic', fontSize: '0.8rem' }}>
                                            <i className="fa-solid fa-terminal" style={{ marginRight: '0.5rem' }}></i>
                                            Press <kbd style={{ background: BAR_BG, border: `1px solid ${BORDER_C}`, borderRadius: '3px', padding: '0.1rem 0.35rem', fontSize: '0.72rem' }}>Ctrl+Enter</kbd> or click <strong>Run</strong> to execute your code.
                                        </div>
                                    )}
                                    {running && (
                                        <div style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <i className="fa-solid fa-spinner fa-spin"></i> Executing {lang.label}…
                                        </div>
                                    )}
                                    {output && (
                                        <pre style={{ margin: 0, color: '#e6edf3', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                            <span style={{ color: TEXT_MUTED, fontSize: '0.72rem', display: 'block', marginBottom: '0.35rem' }}>stdout:</span>
                                            {output}
                                        </pre>
                                    )}
                                    {outputErr && (
                                        <pre style={{ margin: output ? '0.75rem 0 0' : 0, color: '#f87171', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                            <span style={{ color: TEXT_MUTED, fontSize: '0.72rem', display: 'block', marginBottom: '0.35rem' }}>stderr:</span>
                                            {outputErr}
                                        </pre>
                                    )}
                                </div>
                            )}
                            {bottomPanel === 'stdin' && (
                                <div style={{ height: '100%' }}>
                                    <div style={{ fontSize: '0.72rem', color: TEXT_MUTED, marginBottom: '0.4rem' }}>Custom input (stdin) — passed to your program on Run:</div>
                                    <textarea value={stdin} onChange={e => setStdin(e.target.value)} placeholder="Enter input here…"
                                        style={{ width: '100%', height: 'calc(100% - 2rem)', background: DARK_BG, border: `1px solid ${BORDER_C}`, borderRadius: '6px', color: TEXT_MAIN, fontFamily: 'inherit', fontSize: '0.85rem', padding: '0.5rem', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            )}
                            {bottomPanel === 'problem' && (
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.5rem' }}>{task.title}</div>
                                    <p style={{ color: TEXT_MUTED, lineHeight: 1.7, fontSize: '0.8375rem' }}>{task.description || 'No description provided.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SUBMIT CONFIRMATION MODAL ───────────────────────────────────── */}
            {showSubmit && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: PANEL_BG, border: `1px solid ${BORDER_C}`, borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
                        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', padding: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.125rem' }}>Submit Solution?</h3>
                            <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>{task.title}</p>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: DARK_BG, border: `1px solid ${BORDER_C}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: TEXT_MUTED }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span>Language</span><strong style={{ color: TEXT_MAIN }}>{lang.label}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                    <span>Lines of code</span><strong style={{ color: TEXT_MAIN }}>{code.split('\n').length}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Characters</span><strong style={{ color: TEXT_MAIN }}>{code.length.toLocaleString()}</strong>
                                </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8375rem', color: TEXT_MUTED, lineHeight: 1.6 }}>
                                Your current editor content will be submitted for review. Make sure you've tested it with <strong>Run</strong> first.
                            </p>
                            <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontSize: '0.78rem', color: '#f87171' }}>
                                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.4rem' }}></i>
                                Once submitted, your team lead will be notified for review.
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowSubmit(false)} style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: `1px solid ${BORDER_C}`, borderRadius: '8px', color: TEXT_MAIN, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSubmit} disabled={submitting}
                                    style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {submitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting…</> : <><i className="fa-solid fa-paper-plane"></i> Confirm Submit</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TOAST ──────────────────────────────────────────────────────── */}
            {toast && (
                <div style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 3000, background: PANEL_BG, border: `1px solid ${toast.type === 'error' ? '#EF4444' : toast.type === 'warn' ? '#F59E0B' : '#10B981'}`, borderLeft: `4px solid ${toast.type === 'error' ? '#EF4444' : toast.type === 'warn' ? '#F59E0B' : '#10B981'}`, borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '240px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', animation: 'slideIn 0.2s ease' }}>
                    <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: TEXT_MAIN }}>{toast.msg}</span>
                    <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TEXT_MUTED, fontSize: '0.9rem' }}>✕</button>
                </div>
            )}

            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
};

export default CodeEditorPage;
