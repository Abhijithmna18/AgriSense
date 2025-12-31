import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const API_URL = `${BASE_URL}/api`;

const getHomepageConfig = async () => {
    try {
        const response = await axios.get(`${API_URL}/homepage`);
        return response.data;
    } catch (error) {
        console.error('Error fetching homepage config:', error);
        throw error;
    }
};

const updateHomepageConfig = async (configData) => {
    try {
        const token = localStorage.getItem('auth_token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
        const response = await axios.put(`${API_URL}/homepage`, configData, config);
        return response.data;
    } catch (error) {
        console.error('Error updating homepage config:', error);
        throw error;
    }
};

export default {
    getHomepageConfig,
    updateHomepageConfig,
};
