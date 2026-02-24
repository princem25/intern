import config from '../config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

/**
 * Shared fetch wrapper — automatically redirects to /auth/login on 401.
 */
const apiFetch = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: { ...getAuthHeaders(), ...(options.headers || {}) },
    });

    if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        return;
    }

    return response;
};

// ─── HR Approval API ─────────────────────────────────────────────────────────

export const getHRStats = async () => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/stats`);
    if (!response?.ok) throw new Error('Failed to fetch HR stats');
    return response.json();
};

export const getUsers = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const response = await apiFetch(`${config.API_BASE_URL}/hr/users?${qs}`);
    if (!response?.ok) throw new Error('Failed to fetch users');
    return response.json();
};

export const getUserProfile = async (id) => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/users/${id}`);
    if (!response?.ok) throw new Error('Failed to fetch user profile');
    return response.json();
};

export const updateUserStatus = async (userId, status, reason = '') => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reason }),
    });
    if (!response?.ok) throw new Error('Failed to update status');
    return response.json();
};

export const getApprovalLogs = async () => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/logs`);
    if (!response?.ok) throw new Error('Failed to fetch approval logs');
    return response.json();
};

// ─── Team Lead Assignment API ─────────────────────────────────────────────────

export const getAssignmentStats = async () => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/assignments/stats`);
    if (!response?.ok) throw new Error('Failed to fetch assignment stats');
    return response.json();
};

export const getAssignableInterns = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const response = await apiFetch(`${config.API_BASE_URL}/hr/assignments/interns?${qs}`);
    if (!response?.ok) throw new Error('Failed to fetch interns');
    return response.json();
};

export const getTeamLeads = async () => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/assignments/leads`);
    if (!response?.ok) throw new Error('Failed to fetch team leads');
    return response.json();
};

export const assignTeamLead = async (internIds, teamLeadId) => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/assignments/assign`, {
        method: 'POST',
        body: JSON.stringify({ intern_ids: internIds, team_lead_id: teamLeadId }),
    });
    if (!response?.ok) throw new Error('Failed to assign team lead');
    return response.json();
};

export const unassignIntern = async (internId) => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/assignments/${internId}`, {
        method: 'DELETE',
    });
    if (!response?.ok) throw new Error('Failed to unassign intern');
    return response.json();
};

export const getLeadInterns = async (leadId) => {
    const response = await apiFetch(`${config.API_BASE_URL}/hr/assignments/leads/${leadId}/interns`);
    if (!response?.ok) throw new Error('Failed to fetch lead interns');
    return response.json();
};

// ─── Legacy ───────────────────────────────────────────────────────────────────

export const getPendingUsers = async () => {
    const response = await apiFetch(`${config.API_BASE_URL}/admin/pending-users`);
    if (!response?.ok) throw new Error('Failed to fetch pending users');
    return response.json();
};
