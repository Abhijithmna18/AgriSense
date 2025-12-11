import axios from 'axios';

// Create a dedicated instance for Admin API
const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5002';
    return url.endsWith('/api') ? url : `${url}/api`;
};

const adminApi = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add Auth Token and X-Actor ID
adminApi.interceptors.request.use((config) => {
    // Check for token in both possible storage locations
    const userInfo = localStorage.getItem('userInfo');
    const authToken = localStorage.getItem('auth_token');

    if (userInfo) {
        const { token, _id } = JSON.parse(userInfo);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (_id) {
            config.headers['X-Actor'] = _id;
        }
    } else if (authToken) {
        // Fallback to auth_token if userInfo doesn't exist
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Helper to audit actions where the server might not auto-audit (e.g. if we want client-side confirmation)
// Although server routes *should* handle auditing, this is for redundancy or custom client events.
export const auditAction = async (action, entity, entityId, changes, details) => {
    try {
        await adminApi.post('/admin/audit', {
            action,
            entity,
            entityId,
            changes,
            details
        });
    } catch (err) {
        console.error("Failed to push client audit log", err);
    }
};

export default adminApi;
