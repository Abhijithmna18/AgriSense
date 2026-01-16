import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/finance` : 'http://localhost:5002/api/finance';

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getFinancialSnapshot = async () => {
    const response = await axios.get(`${API_URL}/snapshot`, getAuthHeader());
    return response.data;
};

export const checkEligibility = async () => {
    const response = await axios.post(`${API_URL}/eligibility`, {}, getAuthHeader());
    return response.data;
};

export const applyForLoan = async (loanData) => {
    const response = await axios.post(`${API_URL}/apply`, loanData, getAuthHeader());
    return response.data;
};

export const getLoans = async () => {
    const response = await axios.get(`${API_URL}/loans`, getAuthHeader());
    return response.data;
};

export const getTransactions = async () => {
    const response = await axios.get(`${API_URL}/transactions`, getAuthHeader());
    return response.data;
};
