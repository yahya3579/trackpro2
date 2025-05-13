// User storage utility functions

/**
 * Get current user data
 */
export function getUserData() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
} 