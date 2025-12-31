import axios from 'axios';

// Configure base URL based on environment or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

const getAuthHeader = () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Farmer
export const createBookingRequest = async (bookingData) => {
    try {
        const response = await axios.post(`${API_URL}/bookings`, bookingData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMyBookings = async () => {
    try {
        const response = await axios.get(`${API_URL}/bookings/my`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const addTransportDetails = async (id, transportDetails) => {
    try {
        const response = await axios.put(`${API_URL}/bookings/${id}/transport`, transportDetails, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createPaymentOrder = async (id, newDuration) => {
    try {
        const response = await axios.post(`${API_URL}/bookings/${id}/payment/order`, { newDuration }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const verifyPayment = async (id, paymentData) => {
    // paymentData: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    try {
        const response = await axios.post(`${API_URL}/bookings/${id}/payment/verify`, paymentData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Admin
export const getAllBookings = async () => {
    try {
        const response = await axios.get(`${API_URL}/bookings`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const approveBooking = async (id, approvalData) => {
    try {
        const response = await axios.put(`${API_URL}/bookings/${id}/approve`, approvalData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const finalizeBooking = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/bookings/${id}/finalize`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
