import api from './api';

/**
 * Help Center Service
 * 
 * Handles all API calls related to help center articles
 */

const BASE_URL = '/resources/help';

/**
 * Get all help articles with filters
 * @param {Object} params - Query parameters (type, category, search, page, limit, etc.)
 * @returns {Promise} API response with articles list
 */
export const getAllHelpArticles = async (params = {}) => {
    const response = await api.get(BASE_URL, { params });
    return response.data;
};

/**
 * Get single help article by slug
 * @param {string} slug - Article slug
 * @returns {Promise} API response with article details
 */
export const getHelpArticleBySlug = async (slug) => {
    const response = await api.get(`${BASE_URL}/${slug}`);
    return response.data;
};

/**
 * Get help articles by category
 * @param {string} category - Category name
 * @param {Object} params - Query parameters (page, limit, sort)
 * @returns {Promise} API response with articles list
 */
export const getHelpArticlesByCategory = async (category, params = {}) => {
    const response = await api.get(`${BASE_URL}/category/${category}`, { params });
    return response.data;
};

/**
 * Get help articles by type
 * @param {string} type - Article type (faq, guide, tutorial, troubleshooting, documentation)
 * @param {Object} params - Query parameters (page, limit, sort)
 * @returns {Promise} API response with articles list
 */
export const getHelpArticlesByType = async (type, params = {}) => {
    const response = await api.get(`${BASE_URL}/type/${type}`, { params });
    return response.data;
};

/**
 * Get featured help articles
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise} API response with featured articles
 */
export const getFeaturedHelpArticles = async (limit = 5) => {
    const response = await api.get(`${BASE_URL}/featured`, { params: { limit } });
    return response.data;
};

/**
 * Get popular help articles
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise} API response with popular articles
 */
export const getPopularHelpArticles = async (limit = 10) => {
    const response = await api.get(`${BASE_URL}/popular`, { params: { limit } });
    return response.data;
};

/**
 * Get related help articles
 * @param {string} id - Article ID
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise} API response with related articles
 */
export const getRelatedHelpArticles = async (id, limit = 5) => {
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
 * Get all types with article counts
 * @returns {Promise} API response with types list
 */
export const getTypes = async () => {
    const response = await api.get(`${BASE_URL}/types/list`);
    return response.data;
};

/**
 * Search help articles
 * @param {string} query - Search query
 * @param {Object} params - Query parameters (page, limit)
 * @returns {Promise} API response with search results
 */
export const searchHelpArticles = async (query, params = {}) => {
    const response = await api.get(`${BASE_URL}/search`, { 
        params: { q: query, ...params } 
    });
    return response.data;
};

/**
 * Mark article as helpful (requires authentication)
 * @param {string} id - Article ID
 * @returns {Promise} API response with updated helpfulness data
 */
export const markHelpful = async (id) => {
    const response = await api.post(`${BASE_URL}/${id}/helpful`);
    return response.data;
};

/**
 * Mark article as not helpful (requires authentication)
 * @param {string} id - Article ID
 * @returns {Promise} API response with updated helpfulness data
 */
export const markNotHelpful = async (id) => {
    const response = await api.post(`${BASE_URL}/${id}/not-helpful`);
    return response.data;
};

// ============ ADMIN OPERATIONS ============

/**
 * Create new help article (admin only)
 * @param {Object} articleData - Article data
 * @returns {Promise} API response with created article
 */
export const createHelpArticle = async (articleData) => {
    const response = await api.post(BASE_URL, articleData);
    return response.data;
};

/**
 * Update help article (admin only)
 * @param {string} id - Article ID
 * @param {Object} articleData - Updated article data
 * @returns {Promise} API response with updated article
 */
export const updateHelpArticle = async (id, articleData) => {
    const response = await api.put(`${BASE_URL}/${id}`, articleData);
    return response.data;
};

/**
 * Delete help article (admin only)
 * @param {string} id - Article ID
 * @returns {Promise} API response
 */
export const deleteHelpArticle = async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Toggle publish status (admin only)
 * @param {string} id - Article ID
 * @returns {Promise} API response with updated status
 */
export const togglePublishHelpArticle = async (id) => {
    const response = await api.patch(`${BASE_URL}/${id}/publish`);
    return response.data;
};

/**
 * Toggle featured status (admin only)
 * @param {string} id - Article ID
 * @param {number} priority - Priority value (optional)
 * @returns {Promise} API response with updated status
 */
export const toggleFeatureHelpArticle = async (id, priority) => {
    const response = await api.patch(`${BASE_URL}/${id}/feature`, { priority });
    return response.data;
};

export default {
    getAllHelpArticles,
    getHelpArticleBySlug,
    getHelpArticlesByCategory,
    getHelpArticlesByType,
    getFeaturedHelpArticles,
    getPopularHelpArticles,
    getRelatedHelpArticles,
    getCategories,
    getTypes,
    searchHelpArticles,
    markHelpful,
    markNotHelpful,
    createHelpArticle,
    updateHelpArticle,
    deleteHelpArticle,
    togglePublishHelpArticle,
    toggleFeatureHelpArticle
};
