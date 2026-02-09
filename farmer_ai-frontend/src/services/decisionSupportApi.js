import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

/**
 * Call the Decision Support Engine to analyze a crop cycle.
 * @param {Object} data - Input payload (farmDetails, cropDetails, etc.)
 * @returns {Promise<Object>} - The analysis result (JSON)
 */
export const analyzeCropViability = async (data) => {
    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.post(`${API_URL}/api/decision-support/analyze`, data, config);

        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Analysis failed');
        }
    } catch (error) {
        console.error("Decision Support Engine Error:", error);
        throw error;
    }
};
