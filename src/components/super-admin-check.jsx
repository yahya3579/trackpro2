"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminCheck({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated and is a super admin
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      // Redirect to login page if not authenticated
      router.push('/login');
      return;
    }
    
    const checkAccess = async () => {
      try {
        const user = JSON.parse(userData);
        
        // Quick check based on role
        if (user.role === 'super_admin') {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // If not a direct super admin, check for org owner with super admin access
        if (user.role === 'organization_admin') {
          // Check with server if the organization admin has super admin access
          const response = await fetch('http://localhost:5000/api/admin/verify-org-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({
              email: user.email
            })
          });
          
          if (response.ok) {
            // This org admin has super admin access
            // Auto-login as super admin
            
            // Fetch super admin details using organization credentials
            const superAdminResponse = await fetch("http://localhost:5000/api/auth/super-admin-login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token
              },
              body: JSON.stringify({
                email: user.email,
                is_org_owner: true
              }),
            });
            
            if (superAdminResponse.ok) {
              const superAdminData = await superAdminResponse.json();
              
              // Save original org data
              localStorage.setItem('org_user_data', userData);
              
              // Store the token and super admin user info
              localStorage.setItem("token", superAdminData.token);
              localStorage.setItem("user", JSON.stringify(superAdminData.user));
              
              // Now we have super admin credentials, refresh the page
              window.location.reload();
              return;
            }
          }
        }
        
        // If we get here, not authorized
        alert('You do not have super admin permissions. Please login with a super admin account.');
        router.push('/dashboard');
      } catch (error) {
        console.error('Error checking super admin status:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [router]);

  // Show loading indicator while checking
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show children only when authorized as super admin
  return isAuthorized ? children : null;
} 