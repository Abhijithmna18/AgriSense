import axios from 'axios';

// Create API instance
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5002') + '/api/recommendations',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Auth Interceptor
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    const authToken = localStorage.getItem('auth_token');

    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } else if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
});

export const recommendationsApi = {
    // Run inference
    getRecommendations: async (data) => {
        return await api.post('/run', data);
    },

    // Get past history
    getHistory: async (limit = 10) => {
        return await api.get(`/history?limit=${limit}`);
    },

    // Save/Update status
    saveRecommendation: async (id, status, note) => {
        return await api.post(`/${id}/save`, { status, note });
    }
};

export default recommendationsApi;
