import config from '../config';

export const login = async (email, password) => {
    try {
        const response = await fetch(`${config.API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data; // { user, token, message }
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await fetch(`${config.API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed'); // Could contain validation errors
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        try {
            await fetch(`${config.API_BASE_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Logout error', error);
        }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

export const forgotPassword = async (email) => {
    try {
        const response = await fetch(`${config.API_BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.email || data.message || 'Failed to send reset link');
        }

        return data; // { status: "..." }
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (token, email, password, password_confirmation) => {
    try {
        const response = await fetch(`${config.API_BASE_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ token, email, password, password_confirmation: password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.email || data.message || 'Failed to reset password');
        }

        return data; // { status: "..." }
    } catch (error) {
        throw error;
    }
};
