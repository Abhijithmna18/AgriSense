import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all farms for authenticated user
export const getFarms = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/farms`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching farms:', error);
        throw error;
    }
};

// Get single farm by ID
export const getFarm = async (farmId) => {
    try {
        const response = await axios.get(`${API_URL}/api/farms/${farmId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching farm:', error);
        throw error;
    }
};

// Create new farm
export const createFarm = async (farmData) => {
    try {
        const response = await axios.post(`${API_URL}/api/farms`, farmData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating farm:', error);
        throw error;
    }
};

// Update farm
export const updateFarm = async (farmId, farmData) => {
    try {
        const response = await axios.put(`${API_URL}/api/farms/${farmId}`, farmData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating farm:', error);
        throw error;
    }
};

// Delete farm
export const deleteFarm = async (farmId) => {
    try {
        const response = await axios.delete(`${API_URL}/api/farms/${farmId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting farm:', error);
        throw error;
    }
};

export const farmAPI = {
    getFarms,
    getFarm,
    createFarm,
    updateFarm,
    deleteFarm
};
