import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout')
};

// Wallet APIs
export const walletAPI = {
    getWallet: () => api.get('/wallet'),
    deposit: (data) => api.post('/wallet/deposit', data),
    withdraw: (data) => api.post('/wallet/withdraw', data),
    getStatement: (params) => api.get('/wallet/statement', { params })
};

// Transaction APIs
export const transactionAPI = {
    sendMoney: (data) => api.post('/transactions/send', data),
    requestPayment: (data) => api.post('/transactions/request', data),
    getTransactions: (params) => api.get('/transactions', { params }),
    getTransaction: (id) => api.get(`/transactions/${id}`)
};

// Payment APIs
export const paymentAPI = {
    generateQR: (data) => api.post('/payments/generate-qr', data),
    upiPayment: (data) => api.post('/payments/upi', data),
    scanQR: (data) => api.post('/payments/scan-qr', data)
};

// Bill APIs
export const billAPI = {
    getBills: (params) => api.get('/bills', { params }),
    createBill: (data) => api.post('/bills', data),
    payBill: (id) => api.post(`/bills/${id}/pay`),
    getUpcomingBills: () => api.get('/bills/upcoming'),
    deleteBill: (id) => api.delete(`/bills/${id}`)
};

// Savings Goal APIs
export const savingsAPI = {
    getGoals: (params) => api.get('/savings-goals', { params }),
    createGoal: (data) => api.post('/savings-goals', data),
    addContribution: (id, data) => api.post(`/savings-goals/${id}/contribute`, data),
    updateGoal: (id, data) => api.put(`/savings-goals/${id}`, data),
    deleteGoal: (id) => api.delete(`/savings-goals/${id}`)
};

// Fixed Deposit APIs
export const fdAPI = {
    getFDs: (params) => api.get('/fixed-deposits', { params }),
    createFD: (data) => api.post('/fixed-deposits', data),
    withdrawFD: (id) => api.post(`/fixed-deposits/${id}/withdraw`),
    calculateMaturity: (params) => api.get('/fixed-deposits/calculate', { params })
};

// Card APIs
export const cardAPI = {
    getCards: () => api.get('/cards'),
    createCard: (data) => api.post('/cards', data),
    toggleFreeze: (id, data) => api.put(`/cards/${id}/freeze`, data),
    updateLimits: (id, data) => api.put(`/cards/${id}/limits`, data),
    getCardDetails: (id) => api.get(`/cards/${id}/details`)
};

// Notification APIs
export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// Security APIs
export const securityAPI = {
    sendOTP: (data) => api.post('/security/send-otp', data),
    verifyOTP: (data) => api.post('/security/verify-otp', data),
    changePin: (data) => api.post('/security/change-pin', data)
};

export default api;
