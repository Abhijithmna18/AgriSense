import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('auth_token');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    register: (data) => api.post('/api/auth/register', data),
    verifyEmail: (data) => api.post('/api/auth/verify-email', data),
    resendOtp: (data) => api.post('/api/auth/resend-otp', data),
    login: (data) => api.post('/api/auth/login', data),
    googleLogin: (idToken) => api.post('/api/auth/google-login', { idToken }),
    logout: () => api.post('/api/auth/logout'),
    getMe: () => api.get('/api/users/me'),
    getDashboard: () => api.get('/api/dashboard')
};

export default api;
