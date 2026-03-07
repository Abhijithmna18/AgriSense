import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${API_URL}/api/finance/minibank`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ==================== WALLET API ====================

export const getWalletBalance = async () => {
    const response = await api.get('/wallet/balance');
    return response.data.data;
};

export const updateWalletBalance = async (amount, type) => {
    const response = await api.post('/wallet/update', { amount, type });
    return response.data.data;
};

// ==================== TRANSACTION API ====================

export const sendMoney = async (receiverId, amount, description) => {
    const response = await api.post('/transactions/send', { receiverId, amount, description });
    return response.data.data;
};

export const requestPayment = async (toUserId, amount, description) => {
    const response = await api.post('/transactions/request', { toUserId, amount, description });
    return response.data.data;
};

export const processQRPayment = async (qrData) => {
    const response = await api.post('/transactions/qr-payment', { qrData });
    return response.data.data;
};

export const getRecentTransactions = async (limit = 5) => {
    const response = await api.get(`/transactions/recent?limit=${limit}`);
    return response.data.data;
};

// ==================== BILL API ====================

export const getUpcomingBills = async () => {
    const response = await api.get('/bills/upcoming');
    return response.data.data;
};

export const payBill = async (billId) => {
    const response = await api.post('/bills/pay', { billId });
    return response.data.data;
};

// ==================== SAVINGS GOAL API ====================

export const getSavingsGoals = async () => {
    const response = await api.get('/savings/goals');
    return response.data.data;
};

export const createSavingsGoal = async (goalData) => {
    const response = await api.post('/savings/goals', goalData);
    return response.data.data;
};

export const addSavingsContribution = async (goalId, contribution) => {
    console.log('=== Frontend: addSavingsContribution ===');
    console.log('Sending:', { goalId, contribution });
    const response = await api.post('/savings/contribute', { goalId, contribution });
    console.log('Response:', response.data);
    return response.data.data;
};

// ==================== FIXED DEPOSIT API ====================

export const getActiveFDs = async () => {
    const response = await api.get('/fixed-deposits/active');
    return response.data.data;
};

export const createFixedDeposit = async (fdData) => {
    const response = await api.post('/fixed-deposits/create', fdData);
    return response.data.data;
};

export const calculateFDInterest = async (principal, rate, duration) => {
    const response = await api.get(`/fixed-deposits/calculate?principal=${principal}&rate=${rate}&duration=${duration}`);
    return response.data.data;
};

// ==================== VIRTUAL CARD API ====================

export const getVirtualCard = async () => {
    const response = await api.get('/cards/details');
    return response.data.data;
};

export const generateVirtualCard = async () => {
    const response = await api.post('/cards/generate');
    return response.data.data;
};

export const freezeCard = async (cardId) => {
    const response = await api.post('/cards/freeze', { cardId });
    return response.data.data;
};

export const setCardLimit = async (cardId, limit) => {
    const response = await api.post('/cards/set-limit', { cardId, limit });
    return response.data.data;
};

// ==================== AI RECOMMENDATIONS API ====================

export const getSavingsAIRecommendations = async () => {
    const response = await api.post('/savings/ai-recommendations');
    return response.data.data;
};

export const getFDRecommendations = async () => {
    const response = await api.post('/fixed-deposits/ai-recommendations');
    return response.data.data;
};

export default api;
