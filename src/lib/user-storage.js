// User storage utility functions

/**
 * Get user data from localStorage
 * @returns {Object|null} User data object or null if not found
 */
export function getUserData() {
  try {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Store user data in localStorage
 * @param {Object} userData - User data to store
 */
export function storeUserData(userData) {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
}

/**
 * Clear user data from localStorage
 */
export function clearUserData() {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a token, false otherwise
 */
export function isAuthenticated() {
  try {
    if (typeof window === 'undefined') return false;
    
    return !!localStorage.getItem('token');
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Get authentication token
 * @returns {string|null} Token or null if not found
 */
export function getToken() {
  try {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
} 