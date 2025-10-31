// Centralized API utility for admin panel
import Cookies from "js-cookie";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Get auth token
const getAuthToken = () => {
    return Cookies.get("jwt");
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

// Admin API functions
export const adminAPI = {
    // Dashboard stats
    getDashboardStats: async () => {
        const [users, payments, kycRequests] = await Promise.all([
            apiCall('/api/getAlluser'),
            apiCall('/api/getpayment'),
            apiCall('/api/getAllUserBank'),
        ]);

        const pendingRecharges = payments.result?.filter(
            (item) => item.transactionType === "recharge" && item.status === "pending"
        ).length || 0;

        const pendingWithdraws = payments.result?.filter(
            (item) => item.transactionType === "withdraw" && item.status === "pending"
        ).length || 0;

        const pendingKYC = kycRequests.result?.filter(
            (item) => item.kycstatus === "pending"
        ).length || 0;

        return {
            totalUsers: users.count || 0,
            totalRecharges: payments.result?.filter(t => t.transactionType === "recharge").length || 0,
            totalWithdraws: payments.result?.filter(t => t.transactionType === "withdraw").length || 0,
            pendingRecharges,
            pendingWithdraws,
            pendingKYC,
        };
    },

    // Users
    getAllUsers: async (page = 1, limit = 10, search = '') => {
        return apiCall(`/api/getAlluser?page=${page}&limit=${limit}&search=${search}`);
    },

    getSingleUser: async (id) => {
        return apiCall('/api/getSingleuser', {
            method: 'POST',
            body: JSON.stringify({ id }),
        });
    },

    deleteUser: async (id) => {
        return apiCall('/api/deleteuser', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    },

    // Transactions
    getTransactions: async (params = {}) => {
        const { page = 1, limit = 10, search = '', transactionType, status } = params;
        let url = `/api/getpayment?page=${page}&limit=${limit}&search=${search}`;

        if (transactionType) url += `&transactionType=${transactionType}`;
        if (status) url += `&status=${status}`;

        return apiCall(url);
    },

    updateTransaction: async (id, status, type) => {
        return apiCall(`/api/updatetransaction/${id}`, {
            method: 'POST',
            body: JSON.stringify({ status, type }),
        });
    },

    // KYC
    getAllKYC: async (page = 1, limit = 10, search = '', kycstatus = '') => {
        let url = `/api/getAllUserBank?page=${page}&limit=${limit}&search=${search}`;
        if (kycstatus) url += `&kycstatus=${kycstatus}`;
        return apiCall(url);
    },

    updateKYC: async (id, kycstatus) => {
        return apiCall('/api/updateUserBank', {
            method: 'PUT',
            body: JSON.stringify({ id, kycstatus }),
        });
    },

    // Crash Percentage
    getCrashPercentages: async () => {
        return apiCall('/api/getcrashpercentage');
    },

    addCrashPercentage: async (data) => {
        return apiCall('/api/insertcrashpercentage', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateCrashPercentage: async (id, data) => {
        return apiCall('/api/updatecrashpercentage', {
            method: 'PUT',
            body: JSON.stringify({ id, ...data }),
        });
    },

    deleteCrashPercentage: async (id) => {
        return apiCall('/api/deletecrashpercentage', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    },
};

export default adminAPI;
