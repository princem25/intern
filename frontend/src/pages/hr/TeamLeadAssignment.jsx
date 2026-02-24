import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    getAssignmentStats,
    getAssignableInterns,
    getTeamLeads,
    assignTeamLead,
    unassignIntern,
} from '../../api/admin';

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    const cfg = {
        success: { color: 'var(--success)', icon: 'fa-circle-check' },
        error: { color: 'var(--danger)', icon: 'fa-circle-xmark' },
        info: { color: 'var(--primary)', icon: 'fa-circle-info' },
    }[type] || { color: 'var(--primary)', icon: 'fa-circle-info' };
    return (
        <div style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 2000,
            background: 'var(--bg-card)',
            border: `1px solid ${cfg.color}`,
            borderLeft: `4px solid ${cfg.color}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            minWidth: '300px', animation: 'slideInRight 0.3s ease',
        }}>
            <i className={`fa-solid ${cfg.icon}`} style={{ color: cfg.color, fontSize: '1.1rem' }}></i>
            <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    );
};

// ─── Confirm Unassign Modal ───────────────────────────────────────────────────
const ConfirmModal = ({ internName, leadName, onConfirm, onCancel }) => (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', backdropFilter: 'blur(4px)',
    }}>
        <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            width: '100%', maxWidth: '400px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            overflow: 'hidden',
        }}>
            <div style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem' }}>
                    <i className="fa-solid fa-user-minus"></i>
                </div>
                <div>
                    <h4 style={{ margin: 0, color: 'white' }}>Unassign Intern</h4>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)' }}>{internName}</p>
                </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Are you sure you want to remove <strong style={{ color: 'var(--text-main)' }}>{internName}</strong> from{' '}
                    <strong style={{ color: 'var(--text-main)' }}>{leadName}</strong>'s team?
                    The intern will become inactive until reassigned.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: '0.75rem', background: 'var(--warning)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', color: 'white' }}>
                        <i className="fa-solid fa-user-minus" style={{ marginRight: '0.4rem' }}></i> Unassign
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TeamLeadAssignment = () => {
    const [stats, setStats] = useState({});
    const [interns, setInterns] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);
    const [selectedInterns, setSelectedInterns] = useState(new Set());
    const [selectedLead, setSelectedLead] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [activeTab, setActiveTab] = useState('assign'); // 'assign' | 'assigned'
    const [toast, setToast] = useState(null);
    const [confirmUnassign, setConfirmUnassign] = useState(null); // { intern }
    const [processingIds, setProcessingIds] = useState(new Set());

    const showToast = (message, type = 'success') => setToast({ message, type });

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (showUnassignedOnly) params.unassigned_only = true;
            if (search) params.search = search;
            const [statsData, internsData, leadsData] = await Promise.all([
                getAssignmentStats(),
                getAssignableInterns(params),
                getTeamLeads(),
            ]);
            setStats(statsData);
            setInterns(internsData);
            setLeads(leadsData);
        } catch (err) {
            showToast('Failed to load data. Please refresh.', 'error');
        } finally {
            setLoading(false);
        }
    }, [search, showUnassignedOnly]);

    useEffect(() => {
        const t = setTimeout(loadAll, 300);
        return () => clearTimeout(t);
    }, [loadAll]);

    // ── Selection helpers ──
    const toggleIntern = (id) => {
        setSelectedInterns(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAllOnPage = () => {
        const ids = displayedInterns.map(i => i.id);
        const allSelected = ids.every(id => selectedInterns.has(id));
        setSelectedInterns(prev => {
            const next = new Set(prev);
            allSelected ? ids.forEach(id => next.delete(id)) : ids.forEach(id => next.add(id));
            return next;
        });
    };

    // ── Assign ──
    const handleAssign = async () => {
        if (selectedInterns.size === 0) { showToast('Select at least one intern.', 'error'); return; }
        if (!selectedLead) { showToast('Please select a Team Lead.', 'error'); return; }
        setAssigning(true);
        try {
            const result = await assignTeamLead([...selectedInterns], Number(selectedLead));
            showToast(result.message, 'success');
            setSelectedInterns(new Set());
            setSelectedLead('');
            loadAll();
        } catch {
            showToast('Assignment failed. Please try again.', 'error');
        } finally {
            setAssigning(false);
        }
    };

    // ── Unassign ──
    const handleUnassignConfirmed = async () => {
        const intern = confirmUnassign?.intern;
        setConfirmUnassign(null);
        if (!intern) return;
        setProcessingIds(prev => new Set(prev).add(intern.id));
        try {
            await unassignIntern(intern.id);
            showToast(`${intern.name} has been unassigned.`, 'info');
            loadAll();
        } catch {
            showToast('Failed to unassign. Please try again.', 'error');
        } finally {
            setProcessingIds(prev => { const s = new Set(prev); s.delete(intern.id); return s; });
        }
    };

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—';

    // Split view between unassigned and assigned interns
    const unassignedInterns = interns.filter(i => !i.team_lead_id);
    const assignedInterns = interns.filter(i => i.team_lead_id);
    const displayedInterns = activeTab === 'assign' ? unassignedInterns : assignedInterns;

    const selectedLead_obj = leads.find(l => l.id === Number(selectedLead));

    return (
        <DashboardLayout role="HR">
            <style>{`
                @keyframes slideInRight { from { transform: translateX(80px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                .intern-row:hover { background: var(--bg-body) !important; }
                .checkbox-custom:checked { accent-color: var(--primary); }
            `}</style>

            {/* ── Header ── */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h2 style={{ margin: 0 }}>Team Lead Assignment</h2>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>
                        Assign approved interns to team leads for supervision and mentorship.
                    </p>
                </div>
                <Button variant="secondary" onClick={loadAll}>
                    <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.5rem' }}></i> Refresh
                </Button>
            </header>

            {/* ── KPI Cards ── */}
            <div className="grid grid-responsive gap-6 mb-8">
                {[
                    { label: 'Total Interns', value: stats.total_interns, icon: 'fa-users', color: 'var(--primary)', bg: 'rgba(79,70,229,0.1)' },
                    {
                        label: 'Unassigned', value: stats.unassigned_interns, icon: 'fa-user-clock', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)',
                        badge: stats.unassigned_interns > 0 ? 'Needs Action' : null
                    },
                    { label: 'Assigned', value: stats.assigned_interns, icon: 'fa-user-check', color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'Active Interns', value: stats.active_interns, icon: 'fa-circle-play', color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' },
                    { label: 'Team Leads', value: stats.total_leads, icon: 'fa-user-tie', color: 'var(--secondary)', bg: 'rgba(124,58,237,0.1)' },
                ].map(card => (
                    <Card key={card.label} className="p-5" style={{ position: 'relative', overflow: 'hidden' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{card.label}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
                                    {loading ? '—' : (card.value ?? 0)}
                                </div>
                                {card.badge && (
                                    <span className="badge badge-warning" style={{ marginTop: '0.4rem' }}>{card.badge}</span>
                                )}
                            </div>
                            <div style={{ width: 44, height: 44, background: card.bg, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className={`fa-solid ${card.icon}`} style={{ fontSize: '1.1rem', color: card.color }}></i>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: card.color, opacity: 0.35 }} />
                    </Card>
                ))}
            </div>

            {/* ── Main Panel ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>

                {/* LEFT: Intern list */}
                <div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-body)', borderRadius: 'var(--radius-lg)', padding: '0.25rem', marginBottom: '1.25rem', width: 'fit-content' }}>
                        {[
                            { key: 'assign', label: `Unassigned (${unassignedInterns.length})`, icon: 'fa-user-clock' },
                            { key: 'assigned', label: `Assigned (${assignedInterns.length})`, icon: 'fa-user-check' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); setSelectedInterns(new Set()); }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                                    color: activeTab === tab.key
                                        ? (tab.key === 'assign' ? 'var(--warning)' : 'var(--success)')
                                        : 'var(--text-muted)',
                                    boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
                                }}
                            >
                                <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filters row */}
                    <div className="flex gap-3 mb-4 items-center flex-wrap">
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}></i>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ width: '100%', padding: '0.625rem 0.75rem 0.625rem 2.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none' }}
                            />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            <input
                                type="checkbox"
                                checked={showUnassignedOnly}
                                onChange={e => setShowUnassignedOnly(e.target.checked)}
                                className="checkbox-custom"
                                style={{ width: 16, height: 16 }}
                            />
                            Unassigned only
                        </label>
                    </div>

                    {/* Intern table */}
                    <Card style={{ padding: 0 }}>
                        {/* Table header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: activeTab === 'assign' ? '36px 2fr 1fr 1fr 100px' : '2fr 1fr 1fr 1fr 100px',
                            gap: '1rem',
                            padding: '0.875rem 1.25rem',
                            borderBottom: '1px solid var(--border)',
                            background: 'var(--bg-body)',
                            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                        }}>
                            {activeTab === 'assign' && (
                                <div>
                                    <input
                                        type="checkbox"
                                        className="checkbox-custom"
                                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                                        onChange={toggleAllOnPage}
                                        checked={displayedInterns.length > 0 && displayedInterns.every(i => selectedInterns.has(i.id))}
                                    />
                                </div>
                            )}
                            {['Intern', 'Technology', activeTab === 'assigned' ? 'Team Lead' : 'Status', 'Joined', 'Action'].map(col => (
                                <div key={col} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</div>
                            ))}
                        </div>

                        {/* Rows */}
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}></i>
                                Loading interns...
                            </div>
                        ) : displayedInterns.length === 0 ? (
                            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
                                <i className="fa-solid fa-users-slash" style={{ fontSize: '3rem', color: 'var(--border)', display: 'block', marginBottom: '1rem' }}></i>
                                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                    {activeTab === 'assign' ? 'No unassigned interns' : 'No assigned interns yet'}
                                </p>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    {activeTab === 'assign' ? 'All approved interns have been assigned.' : 'Assign interns from the Unassigned tab.'}
                                </p>
                            </div>
                        ) : (
                            displayedInterns.map((intern, idx) => {
                                const isSelected = selectedInterns.has(intern.id);
                                const isProcessing = processingIds.has(intern.id);
                                const cols = activeTab === 'assign'
                                    ? '36px 2fr 1fr 1fr 100px'
                                    : '2fr 1fr 1fr 1fr 100px';
                                return (
                                    <div
                                        key={intern.id}
                                        className="intern-row"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: cols,
                                            gap: '1rem',
                                            padding: '1rem 1.25rem',
                                            alignItems: 'center',
                                            borderBottom: idx < displayedInterns.length - 1 ? '1px solid var(--border)' : 'none',
                                            background: isSelected ? 'rgba(var(--primary-rgb),0.04)' : 'transparent',
                                            transition: 'background 0.15s',
                                            opacity: isProcessing ? 0.5 : 1,
                                        }}
                                    >
                                        {activeTab === 'assign' && (
                                            <div>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox-custom"
                                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                                    checked={isSelected}
                                                    onChange={() => toggleIntern(intern.id)}
                                                />
                                            </div>
                                        )}

                                        {/* Intern info */}
                                        <div className="flex items-center gap-3">
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
                                                {intern.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{intern.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{intern.email}</div>
                                            </div>
                                        </div>

                                        {/* Technology */}
                                        <div style={{ fontSize: '0.875rem', color: intern.technology ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: intern.technology ? 'normal' : 'italic' }}>
                                            {intern.technology?.name || 'Not set'}
                                        </div>

                                        {/* Team Lead (assigned tab) / Active status (assign tab) */}
                                        {activeTab === 'assigned' ? (
                                            <div className="flex items-center gap-2">
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontWeight: 700, fontSize: '0.75rem' }}>
                                                    {intern.team_lead?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{intern.team_lead?.name || '—'}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                        {intern.assigned_at ? new Date(intern.assigned_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                                                Approved
                                            </span>
                                        )}

                                        {/* Date joined */}
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                            {formatDate(intern.created_at)}
                                        </div>

                                        {/* Action */}
                                        <div>
                                            {activeTab === 'assign' ? (
                                                <button
                                                    onClick={() => { setSelectedInterns(new Set([intern.id])); }}
                                                    style={{ padding: '0.35rem 0.75rem', background: isSelected ? 'var(--primary)' : 'var(--bg-body)', border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: isSelected ? 'white' : 'var(--text-muted)', transition: 'all 0.15s' }}
                                                >
                                                    {isSelected ? 'Selected' : 'Select'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmUnassign({ intern })}
                                                    disabled={isProcessing}
                                                    style={{ padding: '0.35rem 0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', cursor: isProcessing ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning)', transition: 'all 0.15s' }}
                                                >
                                                    <i className="fa-solid fa-user-minus" style={{ marginRight: '0.3rem' }}></i>
                                                    Unassign
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </Card>
                </div>

                {/* RIGHT: Assignment Panel */}
                <div style={{ position: 'sticky', top: '1rem' }}>
                    {/* Selection summary */}
                    <Card className="p-5 mb-4" style={{
                        border: selectedInterns.size > 0 ? '2px solid var(--primary)' : '1px solid var(--border)',
                        transition: 'border-color 0.2s',
                    }}>
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fa-solid fa-users text-primary"></i>
                            Selected Interns
                        </h4>

                        {selectedInterns.size === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                                <i className="fa-solid fa-hand-pointer" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem', opacity: 0.4 }}></i>
                                <p style={{ fontSize: '0.875rem' }}>Check interns from the list to select them.</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                                    {[...selectedInterns].map(id => {
                                        const intern = interns.find(i => i.id === id);
                                        if (!intern) return null;
                                        return (
                                            <div key={id} className="flex justify-between items-center" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                                                <div className="flex items-center gap-2">
                                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>
                                                        {intern.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{intern.name}</div>
                                                </div>
                                                <button
                                                    onClick={() => toggleIntern(id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem' }}
                                                >
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                    {selectedInterns.size} intern{selectedInterns.size > 1 ? 's' : ''} selected
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Team lead selector */}
                    <Card className="p-5 mb-4">
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fa-solid fa-user-tie text-primary"></i>
                            Select Team Lead
                        </h4>

                        <select
                            value={selectedLead}
                            onChange={e => setSelectedLead(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: `1px solid ${selectedLead ? 'var(--primary)' : 'var(--border)'}`,
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-body)',
                                color: selectedLead ? 'var(--text-main)' : 'var(--text-muted)',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                outline: 'none',
                                marginBottom: '0.75rem',
                                transition: 'border-color 0.2s',
                            }}
                        >
                            <option value="">— Choose a Team Lead —</option>
                            {leads.map(lead => (
                                <option key={lead.id} value={lead.id}>
                                    {lead.name} ({lead.interns_count} intern{lead.interns_count !== 1 ? 's' : ''})
                                </option>
                            ))}
                        </select>

                        {/* Lead preview card */}
                        {selectedLead_obj && (
                            <div style={{ background: 'var(--bg-body)', borderRadius: 'var(--radius-md)', padding: '0.875rem', border: '1px solid var(--border)' }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                        {selectedLead_obj.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{selectedLead_obj.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedLead_obj.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {selectedLead_obj.technology && (
                                        <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{selectedLead_obj.technology.name}</span>
                                    )}
                                    <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                                        {selectedLead_obj.interns_count} current intern{selectedLead_obj.interns_count !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Assign button */}
                    <button
                        onClick={handleAssign}
                        disabled={assigning || selectedInterns.size === 0 || !selectedLead}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: (selectedInterns.size > 0 && selectedLead)
                                ? 'var(--gradient-primary)'
                                : 'var(--bg-body)',
                            color: (selectedInterns.size > 0 && selectedLead) ? 'white' : 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 700,
                            fontSize: '0.9375rem',
                            cursor: (assigning || selectedInterns.size === 0 || !selectedLead) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            boxShadow: (selectedInterns.size > 0 && selectedLead) ? '0 4px 12px rgba(79,70,229,0.35)' : 'none',
                        }}
                    >
                        {assigning ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> Assigning…</>
                        ) : (
                            <><i className="fa-solid fa-link"></i> Assign {selectedInterns.size > 0 ? `(${selectedInterns.size})` : ''} to Team Lead</>
                        )}
                    </button>

                    {/* Team Leads overview */}
                    {leads.length > 0 && (
                        <Card className="p-5" style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fa-solid fa-chart-bar text-primary"></i>
                                Team Distribution
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {leads.map(lead => {
                                    const maxInterns = Math.max(...leads.map(l => l.interns_count), 1);
                                    const pct = Math.round((lead.interns_count / maxInterns) * 100);
                                    return (
                                        <div key={lead.id}>
                                            <div className="flex justify-between items-center" style={{ marginBottom: '0.3rem' }}>
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{lead.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.interns_count} interns</span>
                                            </div>
                                            <div style={{ height: 6, background: 'var(--bg-body)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            {confirmUnassign && (
                <ConfirmModal
                    internName={confirmUnassign.intern.name}
                    leadName={confirmUnassign.intern.team_lead?.name || 'their team lead'}
                    onConfirm={handleUnassignConfirmed}
                    onCancel={() => setConfirmUnassign(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </DashboardLayout>
    );
};

export default TeamLeadAssignment;
