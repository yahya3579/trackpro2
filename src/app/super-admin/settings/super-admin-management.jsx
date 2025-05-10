"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Trash2, UserPlus, RefreshCw, Check, Copy, AlertCircle } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export function SuperAdminManagement() {
  const [orgSuperAdmins, setOrgSuperAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isGranting, setIsGranting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [grantedEmail, setGrantedEmail] = useState("");

  // Create a toast function that's compatible with our UI
  const toast = (props) => {
    if (props.variant === "destructive") {
      return sonnerToast.error(props.title, {
        description: props.description,
      });
    } else {
      return sonnerToast(props.title, {
        description: props.description,
      });
    }
  };

  // Load list of organization super admins
  const loadOrgSuperAdmins = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching super admin list with token:", token ? "Valid token" : "No token");
      
      const response = await fetch("http://localhost:3000/api/admin/org-super-admins", {
        headers: {
          "x-auth-token": token,
        },
      });
      
      console.log("List response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to load super admin list (${response.status})`);
      }
      
      const data = await response.json();
      console.log("Received super admin list:", data);
      
      setOrgSuperAdmins(data.superAdmins || []);
    } catch (error) {
      console.error("Error loading super admins:", error);
      sonnerToast.error("Error", {
        description: error.message || "Could not load super admin list. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Grant super admin access to an organization user
  const grantSuperAdminAccess = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsGranting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/admin/grant-super-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to grant super admin access");
      }

      // Show success message with temporary password
      setTempPassword(data.tempPassword);
      setGrantedEmail(data.userEmail);
      setIsDialogOpen(true);
      
      // Refresh the list
      loadOrgSuperAdmins();
      setEmail("");
    } catch (error) {
      console.error("Error granting super admin access:", error);
      sonnerToast.error("Error", {
        description: error.message || "Failed to grant access. Please try again."
      });
    } finally {
      setIsGranting(false);
    }
  };

  // Copy temporary password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(tempPassword);
    sonnerToast.success("Copied!", {
      description: "Temporary password copied to clipboard"
    });
  };

  // Revoke super admin access
  const revokeSuperAdminAccess = async (email) => {
    if (!confirm(`Are you sure you want to revoke super admin access for ${email}?`)) {
      return;
    }

    try {
      // Show a loading toast
      sonnerToast.loading(`Revoking access for ${email}...`);

      console.log(`Attempting to revoke super admin access for: ${email}`);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      // First verify the super admin exists
      const checkResponse = await fetch(`http://localhost:3000/api/admin/org-super-admins`, {
        headers: {
          "x-auth-token": token,
        },
      });
      
      if (!checkResponse.ok) {
        throw new Error("Failed to verify super admin list");
      }
      
      const checkData = await checkResponse.json();
      const superAdminExists = checkData.superAdmins.some(admin => admin.email === email);
      
      if (!superAdminExists) {
        throw new Error(`No super admin found with email: ${email}`);
      }
      
      console.log(`Verified super admin exists: ${email}`);

      // Now attempt to revoke access
      const response = await fetch("http://localhost:3000/api/admin/revoke-super-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ email }),
      });

      // Log the entire response for debugging
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));
      
      // Get the response data
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        data = { message: "Invalid server response format" };
      }
      
      if (!response.ok) {
        throw new Error(data.message || `Server error (${response.status}): Failed to revoke super admin access`);
      }

      // Success!
      sonnerToast.success("Success", {
        description: `Super admin access revoked for ${email}`
      });
      
      // Refresh the list
      loadOrgSuperAdmins();
    } catch (error) {
      console.error("Error revoking super admin access:", error);
      sonnerToast.error("Error", {
        description: error.message || "Failed to revoke access. Please try again."
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadOrgSuperAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Super Admin Access Management
          </CardTitle>
          <CardDescription className="text-slate-400">
            Grant or revoke super admin access to organization users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={grantSuperAdminAccess} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Organization User Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  placeholder="Enter organization user email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
                <Button type="submit" disabled={isGranting} className="bg-blue-600 hover:bg-blue-700">
                  {isGranting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Granting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Grant Access
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Only existing organization users can be granted super admin access
              </p>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-white">Organization Users with Super Admin Access</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadOrgSuperAdmins}
                className="text-slate-950 hover:text-slate-900 border-slate-700 hover:border-slate-600"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Refresh
              </Button>
            </div>
            
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : orgSuperAdmins.length === 0 ? (
              <div className="py-8 text-center text-slate-450">
                No organization users have super admin access yet
              </div>
            ) : (
              <div className="rounded-md border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-800">
                    <TableRow>
                      <TableHead className="text-slate-300 w-[50px]">#</TableHead>
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Added On</TableHead>
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgSuperAdmins.map((admin, index) => (
                      <TableRow key={admin.id} className="bg-slate-900 hover:bg-slate-800 border-slate-800">
                        <TableCell className="text-slate-400">{index + 1}</TableCell>
                        <TableCell className="font-medium text-white">{admin.name}</TableCell>
                        <TableCell className="text-slate-300">{admin.email}</TableCell>
                        <TableCell className="text-slate-400">
                          {new Date(admin.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {typeof admin.is_org_admin === 'boolean' ? (
                            admin.is_org_admin ? 
                            <span className="px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs">Org Admin</span> :
                            <span className="px-2 py-1 rounded-full bg-purple-900/30 text-purple-400 text-xs">System Admin</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-400 text-xs">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeSuperAdminAccess(admin.email)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Revoke Access</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog with Temporary Password */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <div className="mx-auto my-2 rounded-full bg-green-100 p-2 w-12 h-12 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl text-center">Super Admin Access Granted</DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              Access has been granted to {grantedEmail}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-md p-4 my-2 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-400">Important Security Information</p>
              <p className="text-slate-300 mt-1">
                A temporary password has been generated. This password will only be shown once.
                Please securely share it with the user.
              </p>
            </div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded-md">
            <Label className="text-xs text-slate-400">Temporary Password</Label>
            <div className="flex mt-1">
              <div className="bg-slate-950 py-2 px-3 rounded-l-md flex-1 font-mono text-green-400">
                {tempPassword}
              </div>
              <Button
                variant="outline"
                className="rounded-l-none border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy</span>
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsDialogOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Toaster for notifications */}
      <Toaster position="top-right" />
    </div>
  );
} 