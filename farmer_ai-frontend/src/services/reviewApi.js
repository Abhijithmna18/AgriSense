import api from './authApi';

export const reviewAPI = {
    // Create a review
    createReview: async (orderId, productId, reviewData) => {
        return api.post('/api/reviews', {
            orderId,
            productId,
            ...reviewData
        });
    },

    // Get reviews for a product
    getProductReviews: async (productId, page = 1, limit = 10, sortBy = 'recent') => {
        return api.get(`/api/reviews/product/${productId}?page=${page}&limit=${limit}&sortBy=${sortBy}`);
    },

    // Get reviews for a seller
    getSellerReviews: async (sellerId, page = 1, limit = 10, sortBy = 'recent') => {
        return api.get(`/api/reviews/seller/${sellerId}?page=${page}&limit=${limit}&sortBy=${sortBy}`);
    },

    // Get buyer's reviews
    getMyReviews: async (page = 1, limit = 10) => {
        return api.get(`/api/reviews/my-reviews?page=${page}&limit=${limit}`);
    },

    // Get vendor's received reviews
    getVendorReceivedReviews: async (page = 1, limit = 10, sortBy = 'recent') => {
        return api.get(`/api/reviews/vendor/received?page=${page}&limit=${limit}&sortBy=${sortBy}`);
    },

    // Add seller response to review
    addSellerResponse: async (reviewId, comment) => {
        return api.put(`/api/reviews/${reviewId}/response`, { comment });
    },

    // Mark review as helpful
    markHelpful: async (reviewId, helpful) => {
        return api.put(`/api/reviews/${reviewId}/helpful`, { helpful });
    },

    // Delete review
    deleteReview: async (reviewId) => {
        return api.delete(`/api/reviews/${reviewId}`);
    }
};
