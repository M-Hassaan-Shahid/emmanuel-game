import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Payment/Transaction APIs
export const getUserPaymentHistory = async () => {
    const userId = localStorage.getItem('userId');
    const response = await api.post('/api/user-history', { userId });
    return response.data;
};

export const getUserTransactions = async (params = {}) => {
    const response = await api.get('/api/history', { params });
    return response.data;
};

export const createWithdrawal = async (data) => {
    const response = await api.post('/api/withdraw', data);
    return response.data;
};

// Bet APIs
export const getAllBets = async () => {
    const response = await api.get('/api/getAllbet');
    return response.data;
};

export const getUserBets = async (userId) => {
    const response = await api.post('/api/getSinglebet', { userId });
    return response.data;
};

// Plane Crash (Game Results) APIs
export const getAllGameResults = async () => {
    const response = await api.get('/api/getAllplanecrash');
    return response.data;
};

// Promo Code APIs
export const applyPromoCode = async (code, userId) => {
    const response = await api.post('/api/promocodes/apply', { code, userId });
    return response.data;
};

export const validatePromoCode = async (code, userId) => {
    const response = await api.post('/api/promocodes/validate', { code, userId });
    return response.data;
};

// User APIs
export const getUserProfile = async (userId) => {
    const response = await api.post('/api/getSingleuser', { id: userId });
    return response.data;
};

export const updateUserProfile = async (data) => {
    const response = await api.put('/api/updateuser', data);
    return response.data;
};

// Bank Details APIs
export const getBankDetails = async () => {
    const response = await api.get('/api/getbankdetails');
    return response.data;
};

// Broadcast APIs
export const getActiveBroadcasts = async () => {
    const response = await api.get('/api/broadcasts/active');
    return response.data;
};

// Auth APIs
export const sendEmailSignUpOtp = async (email) => {
    const response = await api.post('/api/sendotp', { email });
    return response;
};

export const confirmSignUpEmailOtp = async (email, otp) => {
    const response = await api.post('/api/verifyotpreg', { email, otp });
    return response;
};

export const createUser = async (userData) => {
    const response = await api.post('/api/insertuser', userData);
    return response;
};

export const loginByEmail = async (email, password) => {
    const response = await api.post('/api/userlogin', { email, password });
    return response;
};

export const loginByPhone = async (contact, password) => {
    const response = await api.post('/api/userlogin', { contact, password });
    return response;
};

// Password Reset APIs
export const forgetPasswordSendOtp = async (identifier, method = 'email') => {
    const response = await api.post('/api/sendotp', {
        [method === 'email' ? 'email' : 'contact']: identifier
    });
    return response;
};

export const verifyForgotPasswordOtp = async (identifier, otp, method = 'email') => {
    const response = await api.post('/api/verifyOtp', {
        [method === 'email' ? 'email' : 'contact']: identifier,
        otp
    });
    return response;
};

export const resetForgotPassword = async (identifier, newPassword, method = 'email') => {
    const response = await api.post('/api/resetPassword', {
        [method === 'email' ? 'email' : 'contact']: identifier,
        newPassword
    });
    return response;
};

export default api;
