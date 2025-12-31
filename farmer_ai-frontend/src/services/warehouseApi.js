import axios from 'axios';

// Configure base URL based on environment or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Public
export const getWarehouses = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await axios.get(`${API_URL}/warehouses?${queryParams}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getWarehouseById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/warehouses/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Admin
export const createWarehouse = async (warehouseData) => {
    try {
        const response = await axios.post(`${API_URL}/warehouses`, warehouseData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateWarehouse = async (id, warehouseData) => {
    try {
        const response = await axios.put(`${API_URL}/warehouses/${id}`, warehouseData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteWarehouse = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/warehouses/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};



// Upload Image
export const uploadWarehouseImage = async (formData) => {
    try {
        // Note: API_URL already includes /api, so we target /uploads relative to base? 
        // No, API_URL is .../api. 
        // If we want /api/uploads, we use `${API_URL}/uploads`.
        // Server.js: app.use('/api/uploads', ...)
        const response = await axios.post(`${API_URL}/uploads`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getWarehouseAiReport = async () => {
    try {
        const response = await axios.get(`${API_URL}/warehouses/reports/ai`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
