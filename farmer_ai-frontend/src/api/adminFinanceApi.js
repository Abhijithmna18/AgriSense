import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/admin/finance` : 'http://localhost:5002/api/admin/finance';

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getLoanQueue = async () => {
    const response = await axios.get(`${API_URL}/queue`, getAuthHeader());
    return response.data;
};

export const getLoanDetail = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
};

export const runLoanAnalysis = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/analyze`, {}, getAuthHeader());
    return response.data; // Returns the full JSON from backend
};

export const submitLoanDecision = async (id, decisionData) => {
    // decisionData: { decision: 'approved'|'rejected', note, modifiedAmount }
    const response = await axios.put(`${API_URL}/${id}/decision`, decisionData, getAuthHeader());
    return response.data;
};
