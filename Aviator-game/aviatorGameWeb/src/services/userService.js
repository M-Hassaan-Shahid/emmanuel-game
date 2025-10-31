import Cookies from 'js-cookie';
import { getUserProfile } from './api';

/**
 * Centralized User Service
 * Single source of truth for user data management
 */

// Get user from any available source (priority: AuthContext > localStorage > Cookies)
export const getUser = () => {
    try {
        // Try localStorage first (most up-to-date)
        const userLocal = localStorage.getItem('user');
        if (userLocal) {
            return JSON.parse(userLocal);
        }

        // Fallback to cookies
        const userCookie = Cookies.get('user');
        if (userCookie) {
            return JSON.parse(userCookie);
        }

        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
};

// Get user ID
export const getUserId = () => {
    const user = getUser();
    return user?.id || user?._id || localStorage.getItem('userId');
};

// Get user balance
export const getUserBalance = () => {
    const user = getUser();
    return user?.balance || 0;
};

// Update user in all storage locations
export const updateUser = (userData) => {
    try {
        const userString = JSON.stringify(userData);

        // Update localStorage
        localStorage.setItem('user', userString);

        // Update cookies
        Cookies.set('user', userString, { expires: 7 });

        // Update userId separately for quick access
        if (userData.id || userData._id) {
            localStorage.setItem('userId', userData.id || userData._id);
        }

        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
};

// Sync user data from backend
export const syncUserFromBackend = async () => {
    try {
        const userId = getUserId();
        if (!userId) {
            console.error('No user ID found');
            return null;
        }

        const data = await getUserProfile(userId);
        if (data.success && data.result) {
            updateUser(data.result);
            return data.result;
        }

        return null;
    } catch (error) {
        console.error('Error syncing user from backend:', error);
        return null;
    }
};

// Update only balance (lightweight update)
export const updateBalance = (newBalance) => {
    const user = getUser();
    if (user) {
        user.balance = newBalance;
        updateUser(user);

        // Trigger a custom event for components to listen to
        window.dispatchEvent(new CustomEvent('balanceUpdated', { detail: { balance: newBalance } }));

        return true;
    }
    return false;
};

// Clear user data (logout)
export const clearUser = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    Cookies.remove('user');
    Cookies.remove('token');
};

export default {
    getUser,
    getUserId,
    getUserBalance,
    updateUser,
    syncUserFromBackend,
    updateBalance,
    clearUser,
};
