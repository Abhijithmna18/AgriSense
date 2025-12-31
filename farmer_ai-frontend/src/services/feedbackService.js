import axios from 'axios';

// Create a configured axios instance (assuming standard setup, or just use global axios if preferred)
// Using standard axios with baseURL for now, can be refactored to use a shared api client
const API_URL = 'http://localhost:5000/api/feedback'; // Adjust based on env

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token'); // Assuming standard token storage
    return { headers: { Authorization: `Bearer ${token}` } };
};

const feedbackService = {
    // User: Submit new feedback
    submitFeedback: async (feedbackData) => {
        const config = getAuthHeader();

        // If it is FormData, let browser set Content-Type
        if (feedbackData instanceof FormData) {
            delete config.headers['Content-Type']; // Should be multipart/form-data automatically
        }

        const response = await axios.post(`${API_URL}`, feedbackData, config);
        return response.data;
    },

    getCommunityTrends: async () => {
        const response = await axios.get(`${API_URL}/community`, getAuthHeader());
        return response.data;
    },

    // User: Get my feedback
    getMyFeedback: async () => {
        const response = await axios.get(`${API_URL}/user`, getAuthHeader());
        return response.data;
    },

    // Admin: Get all feedback
    getAllFeedback: async () => {
        const response = await axios.get(`${API_URL}/admin`, getAuthHeader());
        return response.data;
    },

    // Admin: Update status
    updateStatus: async (id, status, priority) => {
        const response = await axios.patch(`${API_URL}/${id}/status`, { status, priority }, getAuthHeader());
        return response.data;
    },

    // Admin: Reply
    replyToFeedback: async (id, message) => {
        const response = await axios.post(`${API_URL}/${id}/reply`, { message }, getAuthHeader());
        return response.data;
    },

    // Admin: Get stats
    getStats: async () => {
        const response = await axios.get(`${API_URL}/stats`, getAuthHeader());
        return response.data;
    }
};

export default feedbackService;
