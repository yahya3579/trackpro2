// User storage utility functions

/**
 * Save current user data as organization data before switching to super admin
 */
export function saveOrgUserData() {
  const currentUserData = localStorage.getItem('user');
  if (currentUserData) {
    localStorage.setItem('org_user_data', currentUserData);
  }
}

/**
 * Restore organization user data when switching back from super admin
 */
export function restoreOrgUserData() {
  const orgUserData = localStorage.getItem('org_user_data');
  if (orgUserData) {
    localStorage.setItem('user', orgUserData);
  }
}

/**
 * Get current user data with fallback to org user data if not available
 */
export function getUserData() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

/**
 * Check if user is in super admin mode
 */
export function isSuperAdminMode() {
  const userData = getUserData();
  return userData && userData.role === 'super_admin';
}

/**
 * Get organization user data
 */
export function getOrgUserData() {
  const orgData = localStorage.getItem('org_user_data');
  return orgData ? JSON.parse(orgData) : null;
}

/**
 * Check if the current user has super admin permissions
 */
export async function checkSuperAdminPermission() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const userData = getUserData();
    // First check the cached role
    if (userData && userData.role === 'super_admin') {
      return true;
    }
    
    // Then verify with the server
    const response = await fetch('http://localhost:5000/api/admin/verify-access', {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking super admin permission:', error);
    return false;
  }
} 