"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";
import { saveOrgUserData, checkSuperAdminPermission, getUserData } from "@/lib/user-storage";

export function SuperAdminLoginModal({ isOpen, onClose }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoChecking, setAutoChecking] = useState(true);

  useEffect(() => {
    // Auto-check if the current organization owner has super admin access
    const checkOwnerAccess = async () => {
      if (!isOpen) return;
      
      setAutoChecking(true);
      try {
        const userData = getUserData();
        if (!userData) {
          setAutoChecking(false);
          return;
        }

        // Pre-fill the email field with current user's email
        setFormData(prev => ({
          ...prev,
          email: userData.email || ""
        }));

        const token = localStorage.getItem('token');
        if (!token) {
          setAutoChecking(false);
          return;
        }

        // For organization_admin role, check if they have super admin privileges
        if (userData.role === 'organization_admin') {
          // Check if user is an organization owner with super admin access
          const response = await fetch("http://localhost:5000/api/admin/verify-org-admin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
            body: JSON.stringify({
              email: userData.email,
            }),
          });
          
          if (response.ok) {
            console.log("Organization owner verified as super admin, proceeding with auto-login");
            // Organization owner has super admin access
            // Save org user data and auto-login as super admin
            saveOrgUserData();
            
            // Fetch super admin details using organization credentials
            const superAdminResponse = await fetch("http://localhost:5000/api/auth/super-admin-login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token
              },
              body: JSON.stringify({
                email: userData.email,
                is_org_owner: true
              }),
            });
            
            const superAdminData = await superAdminResponse.json();
            
            if (!superAdminResponse.ok) {
              throw new Error(superAdminData.message || "Failed to auto-login as super admin");
            }
            
            // Store the token and super admin user info
            localStorage.setItem("token", superAdminData.token);
            localStorage.setItem("user", JSON.stringify(superAdminData.user));
            
            // Close the modal
            onClose();
            
            // Navigate to super admin dashboard
            router.push("/super-admin");
            return;
          } else {
            console.log("Organization owner not verified as super admin");
          }
        }
      } catch (error) {
        console.error("Error auto-checking owner access:", error);
        // Silently fail and continue to manual login
      } finally {
        setAutoChecking(false);
      }
    };

    checkOwnerAccess();
  }, [isOpen, router, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      // First check if the user has super admin permissions
      const hasPermission = await checkSuperAdminPermission();
      
      // If not a super admin at all, this will fail quickly
      if (!hasPermission) {
        // Try to first verify if this user's organization account has super admin privileges
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          
          // Check if the attempted login matches the current organization email
          if (user.email === formData.email) {
            try {
              const verifyResponse = await fetch("http://localhost:5000/api/admin/verify-org-admin", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-auth-token": token,
                },
                body: JSON.stringify({
                  email: formData.email,
                }),
              });
              
              if (!verifyResponse.ok) {
                throw new Error("This organization account does not have super admin privileges.");
              }
            } catch (verifyError) {
              throw new Error(verifyError.message || "Super admin access not authorized for this account");
            }
          }
        }
      }

      // Save the original organization user data before switching to super admin
      saveOrgUserData();

      const response = await fetch("http://localhost:5000/api/auth/super-admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Super admin login failed");
      }

      // Store the token and super admin user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Close the modal
      onClose();

      // Navigate to super admin dashboard
      router.push("/super-admin");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto mb-4 rounded-full bg-blue-100 p-3 w-16 h-16 flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">Super Admin Login</DialogTitle>
          <DialogDescription className="text-center">
            Enter your super admin credentials to access the admin portal
          </DialogDescription>
        </DialogHeader>

        {autoChecking ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-center text-sm text-slate-500">
              Checking access credentials...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@trackpro.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="mr-2"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Authenticating..." : "Login as Super Admin"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 