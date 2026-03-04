import api from './api';

/**
 * Crop Knowledge Service
 * 
 * Handles all API calls related to crop knowledge articles
 */

const BASE_URL = '/resources/crop-knowledge';

/**
 * Get all crop knowledge articles with filters
 * @param {Object} params - Query parameters (category, tags, search, page, limit, etc.)
 * @returns {Promise} API response with articles list
 */
export const getAllCropKnowledge = async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
};

/**
 * Get single crop knowledge article by slug
 * @param {string} slug - Article slug
 * @returns {Promise} API response with article details
 */
export const getCropKnowledgeBySlug = async (slug) => {
    const response = await api.get(`${BASE_URL}/${slug}`);
    return response.data;
};

/**
 * Get crop knowledge articles by category
 * @param {string} category - Category name
 * @param {Object} params - Query parameters (page, limit, sort)
 * @returns {Promise} API response with articles list
 */
export const getCropKnowledgeByCategory = async (category, params = {}) => {
    const response = await api.get(`${BASE_URL}/category/${category}`, { params });
    return response.data;
};

/**
 * Get featured crop knowledge articles
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise} API response with featured articles
 */
export const getFeaturedCropKnowledge = async (limit = 5) => {
    const response = await api.get(`${BASE_URL}/featured`, { params: { limit } });
    return response.data;
};

/**
 * Get popular crop knowledge articles
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise} API response with popular articles
 */
export const getPopularCropKnowledge = async (limit = 10) => {
    const response = await api.get(`${BASE_URL}/popular`, { params: { limit } });
    return response.data;
};

/**
 * Get related crop knowledge articles
 * @param {string} id - Article ID
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise} API response with related articles
 */
export const getRelatedCropKnowledge = async (id, limit = 5) => {
    const response = await api.get(`${BASE_URL}/${id}/related`, { params: { limit } });
    return response.data;
};

/**
 * Get all categories with article counts
 * @returns {Promise} API response with categories list
 */
export const getCategories = async () => {
    const response = await api.get(`${BASE_URL}/categories/list`);
    return response.data;
};

/**
 * Get all tags with usage counts
 * @returns {Promise} API response with tags list
 */
export const getTags = async () => {
    const response = await api.get(`${BASE_URL}/tags/list`);
    return response.data;
};

/**
 * Search crop knowledge articles
 * @param {string} query - Search query
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} API response with search results
 */
export const searchCropKnowledge = async (query, params = {}) => {
    const response = await api.get(`${BASE_URL}/search`, { 
        params: { q: query, ...params } 
    });
    return response.data;
};

/**
 * Toggle like on crop knowledge article (requires authentication)
 * @param {string} id - Article ID
 * @returns {Promise} API response with updated like status
 */
export const toggleLikeCropKnowledge = async (id) => {
    const response = await api.post(`${BASE_URL}/${id}/like`);
    return response.data;
};

// ============ ADMIN OPERATIONS ============

/**
 * Create new crop knowledge article (admin only)
 * @param {Object} articleData - Article data
 * @returns {Promise} API response with created article
 */
export const createCropKnowledge = async (articleData) => {
    const response = await api.post(BASE_URL, articleData);
    return response.data;
};

/**
 * Update crop knowledge article (admin only)
 * @param {string} id - Article ID
 * @param {Object} articleData - Updated article data
 * @returns {Promise} API response with updated article
 */
export const updateCropKnowledge = async (id, articleData) => {
    const response = await api.put(`${BASE_URL}/${id}`, articleData);
    return response.data;
};

/**
 * Delete crop knowledge article (admin only)
 * @param {string} id - Article ID
 * @returns {Promise} API response
 */
export const deleteCropKnowledge = async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Toggle publish status (admin only)
 * @param {string} id - Article ID
 * @returns {Promise} API response with updated status
 */
export const togglePublishCropKnowledge = async (id) => {
    const response = await api.patch(`${BASE_URL}/${id}/publish`);
    return response.data;
};

/**
 * Toggle featured status (admin only)
 * @param {string} id - Article ID
 * @param {number} order - Featured order (optional)
 * @returns {Promise} API response with updated status
 */
export const toggleFeatureCropKnowledge = async (id, order) => {
    const response = await api.patch(`${BASE_URL}/${id}/feature`, { order });
    return response.data;
};

export default {
    getAllCropKnowledge,
    getCropKnowledgeBySlug,
    getCropKnowledgeByCategory,
    getFeaturedCropKnowledge,
    getPopularCropKnowledge,
    getRelatedCropKnowledge,
    getCategories,
    getTags,
    searchCropKnowledge,
    toggleLikeCropKnowledge,
    createCropKnowledge,
    updateCropKnowledge,
    deleteCropKnowledge,
    togglePublishCropKnowledge,
    toggleFeatureCropKnowledge
};
