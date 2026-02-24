import config from '../config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

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

const BASE = `${config.API_BASE_URL}/tasks`;

export const getTaskStats = async () => {
    const r = await apiFetch(`${BASE}/stats`);
    if (!r?.ok) throw new Error('Failed to fetch task stats');
    return r.json();
};

export const getTasks = async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const r = await apiFetch(`${BASE}?${qs}`);
    if (!r?.ok) throw new Error('Failed to fetch tasks');
    return r.json();
};

export const getTask = async (id) => {
    const r = await apiFetch(`${BASE}/${id}`);
    if (!r?.ok) throw new Error('Failed to fetch task');
    return r.json();
};

export const createTask = async (data) => {
    const r = await apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) });
    if (!r?.ok) {
        const err = await r.json().catch(() => ({}));
        // Laravel validation errors: { errors: { field: ['msg'] } }
        const firstError = err.errors
            ? Object.values(err.errors).flat()[0]
            : (err.message || 'Failed to create task');
        throw new Error(firstError);
    }
    return r.json();
};

export const updateTask = async (id, data) => {
    const r = await apiFetch(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!r?.ok) {
        const err = await r.json().catch(() => ({}));
        const firstError = err.errors
            ? Object.values(err.errors).flat()[0]
            : (err.message || 'Failed to update task');
        throw new Error(firstError);
    }
    return r.json();
};

export const deleteTask = async (id) => {
    const r = await apiFetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!r?.ok) throw new Error('Failed to delete task');
    return r.status === 204 ? null : r.json();
};

export const submitTask = async (id, submission) => {
    const r = await apiFetch(`${BASE}/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ submission }),
    });
    if (!r?.ok) throw new Error('Failed to submit task');
    return r.json();
};

export const reviewTask = async (id, { feedback, score, status }) => {
    const r = await apiFetch(`${BASE}/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ feedback, score, status }),
    });
    if (!r?.ok) throw new Error('Failed to save review');
    return r.json();
};
