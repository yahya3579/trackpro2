"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserData, storeUserData } from "@/lib/user-storage";

// Create context
const OrganizationContext = createContext();

export function OrganizationProvider({ children }) {
  const [organizationData, setOrganizationData] = useState({
    id: null,
    name: '',
    email: '',
    role: '',
    photoUrl: null,
    isLoading: true
  });

  // Function to fetch user profile data from API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update state with fetched data
        setOrganizationData(prevData => ({
          ...prevData,
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          photoUrl: data.user.photoUrl,
          isLoading: false
        }));
        
        // Update localStorage with fresh data
        storeUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setOrganizationData(prevData => ({
        ...prevData,
        isLoading: false
      }));
    }
  };

  // Update organization data (for name or photo changes)
  const updateOrganizationData = (newData) => {
    setOrganizationData(prevData => {
      const updatedData = { ...prevData, ...newData };
      
      // Update localStorage with new data
      const userData = getUserData();
      if (userData) {
        storeUserData({ ...userData, ...newData });
      }
      
      return updatedData;
    });
  };

  useEffect(() => {
    // First try to get data from localStorage
    try {
      const userData = getUserData();
      if (userData) {
        setOrganizationData({
          id: userData.id,
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || '',
          photoUrl: userData.photoUrl || null,
          isLoading: true
        });
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Then fetch fresh data from API
    fetchUserProfile();
  }, []);

  // Get the initials of the organization name (utility function)
  const getInitials = (name) => {
    if (!name) return 'O';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Context value
  const value = {
    ...organizationData,
    refreshProfile: fetchUserProfile,
    updateProfile: updateOrganizationData,
    getInitials
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

// Custom hook to use the organization context
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
} 