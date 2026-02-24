import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: { Authorization: `Bearer ${token}` }
    };
};

export const logisticsApi = {
    predictSpoilageRisk: async (payload) => {
        try {
            const response = await axios.post(`${BASE_URL}/logistics/predict-risk`, payload, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Failed to get logistics prediction:', error);
            throw error.response?.data?.message || 'Failed to analyze shipment risk.';
        }
    }
};
