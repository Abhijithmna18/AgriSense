import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const negotiationAPI = {
    // Get negotiation details
    async getNegotiation(negotiationId) {
        try {
            const response = await api.get(`/api/negotiations/${negotiationId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching negotiation:', error);
            throw error;
        }
    },

    // Create new negotiation
    async createNegotiation(productId, vendorId, initialTerms) {
        try {
            const response = await api.post('/api/negotiations', {
                productId,
                vendorId,
                initialTerms,
                type: 'buyer_initiated'
            });
            return response.data;
        } catch (error) {
            console.error('Error creating negotiation:', error);
            throw error;
        }
    },

    // Submit new offer
    async submitOffer(negotiationId, offerData) {
        try {
            const response = await api.post(`/api/negotiations/${negotiationId}/offers`, {
                ...offerData,
                timestamp: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting offer:', error);
            throw error;
        }
    },

    // Accept an offer
    async acceptOffer(negotiationId, offerId) {
        try {
            const response = await api.post(`/api/negotiations/${negotiationId}/offers/${offerId}/accept`, {
                timestamp: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Error accepting offer:', error);
            throw error;
        }
    },

    // Reject an offer
    async rejectOffer(negotiationId, offerId, reason) {
        try {
            const response = await api.post(`/api/negotiations/${negotiationId}/offers/${offerId}/reject`, {
                reason,
                timestamp: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Error rejecting offer:', error);
            throw error;
        }
    },

    // Add message to offer
    async addMessage(negotiationId, offerId, messageData) {
        try {
            const formData = new FormData();
            formData.append('message', messageData.message);
            formData.append('timestamp', messageData.timestamp);
            
            // Add attachments if any
            if (messageData.attachments && messageData.attachments.length > 0) {
                messageData.attachments.forEach((attachment, index) => {
                    formData.append(`attachments`, attachment.file);
                });
            }

            const response = await api.post(
                `/api/negotiations/${negotiationId}/offers/${offerId}/messages`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error adding message:', error);
            throw error;
        }
    },

    // Get buyer's active negotiations
    async getBuyerNegotiations(status = null, page = 1, limit = 10) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            
            if (status) {
                params.append('status', status);
            }

            const response = await api.get(`/api/negotiations/buyer?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching buyer negotiations:', error);
            throw error;
        }
    },

    // Get vendor's negotiations
    async getVendorNegotiations(status = null, page = 1, limit = 10) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString()
            });
            
            if (status) {
                params.append('status', status);
            }

            const response = await api.get(`/api/negotiations/vendor?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching vendor negotiations:', error);
            throw error;
        }
    },

    // Download negotiation agreement PDF
    async downloadAgreement(negotiationId) {
        try {
            const response = await api.get(`/api/negotiations/${negotiationId}/agreement`, {
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `negotiation-${negotiationId}-agreement.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error downloading agreement:', error);
            throw error;
        }
    },

    // Get negotiation statistics for dashboard
    async getNegotiationStats() {
        try {
            const response = await api.get('/api/negotiations/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching negotiation stats:', error);
            throw error;
        }
    },

    // Cancel negotiation
    async cancelNegotiation(negotiationId, reason) {
        try {
            const response = await api.post(`/api/negotiations/${negotiationId}/cancel`, {
                reason,
                timestamp: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Error canceling negotiation:', error);
            throw error;
        }
    },

    // Extend negotiation deadline
    async extendDeadline(negotiationId, newDeadline, reason) {
        try {
            const response = await api.post(`/api/negotiations/${negotiationId}/extend`, {
                newDeadline,
                reason,
                timestamp: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Error extending deadline:', error);
            throw error;
        }
    },

    // Get negotiation history/audit trail
    async getNegotiationHistory(negotiationId) {
        try {
            const response = await api.get(`/api/negotiations/${negotiationId}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching negotiation history:', error);
            throw error;
        }
    },

    // Validate offer against business rules
    async validateOffer(negotiationId, offerData) {
        try {
            const response = await api.post(`/api/negotiations/${negotiationId}/validate-offer`, offerData);
            return response.data;
        } catch (error) {
            console.error('Error validating offer:', error);
            throw error;
        }
    },

    // Get similar negotiations for reference
    async getSimilarNegotiations(productId, vendorId) {
        try {
            const response = await api.get(`/api/negotiations/similar`, {
                params: { productId, vendorId }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching similar negotiations:', error);
            throw error;
        }
    }
};

export default negotiationAPI;