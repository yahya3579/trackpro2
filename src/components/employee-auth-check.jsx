"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeAuthCheck({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      // Redirect to login page if not authenticated
      router.push('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      
      // Check if user is a team member - accept both formats
      const role = user.role?.toLowerCase() || '';
      const isTeamMember = role.replace(/\s/g, '_') === 'team_member' || 
                           role === 'team member';
      
      if (isTeamMember) {
        // Only Team Members can access the employee dashboard
        setIsAuthenticated(true);
      } else {
        // Redirect to regular dashboard if not a team member
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show children only when authenticated
  return isAuthenticated ? children : null;
} 