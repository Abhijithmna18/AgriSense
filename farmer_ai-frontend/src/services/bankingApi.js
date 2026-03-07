import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Wallet APIs
export const walletAPI = {
    getWallet: () => api.get('/banking/wallet'),
    deposit: (data) => api.post('/banking/wallet/deposit', data),
    withdraw: (data) => api.post('/banking/wallet/withdraw', data),
    getStatement: (params) => api.get('/banking/wallet/statement', { params })
};

// Transaction APIs
export const transactionAPI = {
    sendMoney: (data) => api.post('/banking/transactions/send', data),
    requestPayment: (data) => api.post('/banking/transactions/request', data),
    getTransactions: (params) => api.get('/banking/transactions', { params }),
    getTransaction: (id) => api.get(`/banking/transactions/${id}`)
};

// Payment APIs
export const paymentAPI = {
    generateQR: (data) => api.post('/banking/payments/generate-qr', data),
    upiPayment: (data) => api.post('/banking/payments/upi', data),
    scanQR: (data) => api.post('/banking/payments/scan-qr', data)
};

// Bill APIs
export const billAPI = {
    getBills: (params) => api.get('/banking/bills', { params }),
    createBill: (data) => api.post('/banking/bills', data),
    payBill: (id) => api.post(`/banking/bills/${id}/pay`),
    getUpcomingBills: () => api.get('/banking/bills/upcoming'),
    deleteBill: (id) => api.delete(`/banking/bills/${id}`)
};

// Savings Goal APIs
export const savingsAPI = {
    getGoals: (params) => api.get('/banking/savings-goals', { params }),
    createGoal: (data) => api.post('/banking/savings-goals', data),
    addContribution: (id, data) => api.post(`/banking/savings-goals/${id}/contribute`, data),
    updateGoal: (id, data) => api.put(`/banking/savings-goals/${id}`, data),
    deleteGoal: (id) => api.delete(`/banking/savings-goals/${id}`)
};

// Fixed Deposit APIs
export const fdAPI = {
    getFDs: (params) => api.get('/banking/fixed-deposits', { params }),
    createFD: (data) => api.post('/banking/fixed-deposits', data),
    withdrawFD: (id) => api.post(`/banking/fixed-deposits/${id}/withdraw`),
    calculateMaturity: (params) => api.get('/banking/fixed-deposits/calculate', { params })
};

// Card APIs
export const cardAPI = {
    getCards: () => api.get('/banking/cards'),
    createCard: (data) => api.post('/banking/cards', data),
    toggleFreeze: (id, data) => api.put(`/banking/cards/${id}/freeze`, data),
    updateLimits: (id, data) => api.put(`/banking/cards/${id}/limits`, data),
    getCardDetails: (id) => api.get(`/banking/cards/${id}/details`)
};

// Notification APIs
export const notificationAPI = {
    getNotifications: (params) => api.get('/banking/notifications', { params }),
    markAsRead: (id) => api.put(`/banking/notifications/${id}/read`),
    getUnreadCount: () => api.get('/banking/notifications/unread-count'),
    deleteNotification: (id) => api.delete(`/banking/notifications/${id}`)
};

// Security APIs
export const securityAPI = {
    sendOTP: (data) => api.post('/banking/security/send-otp', data),
    verifyOTP: (data) => api.post('/banking/security/verify-otp', data),
    changePin: (data) => api.post('/banking/security/change-pin', data)
};

export default api;
