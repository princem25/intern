import config from '../config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export const getPendingUsers = async () => {
    try {
        const response = await fetch(`${config.API_BASE_URL}/admin/pending-users`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch pending users');
        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const updateUserStatus = async (userId, status) => {
    try {
        const response = await fetch(`${config.API_BASE_URL}/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update status');
        return await response.json();
    } catch (error) {
        throw error;
    }
};
