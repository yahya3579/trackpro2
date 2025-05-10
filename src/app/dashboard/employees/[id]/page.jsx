"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Briefcase, 
  Building, 
  Phone, 
  Calendar, 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Status Badge Component
function StatusBadge({ status }) {
  const statusStyles = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    invited: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || ""}`}>
      {status === "active" && "Active"}
      {status === "invited" && "Invited"}
      {status === "inactive" && "Inactive"}
    </span>
  );
}

// Employee Detail Fields
function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Icon size={14} />
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

// Employee Detail Edit Form
function EmployeeEditForm({ employee, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    position: employee?.position || "",
    department: employee?.department || "",
    phone: employee?.phone || "",
    status: employee?.status || "invited"
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update employee");
      }

      const data = await response.json();
      toast.success("Employee updated successfully");
      onSave(data.employee);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

// Resend Invitation Dialog
function ResendInviteDialog({ employee, isOpen, onClose, onConfirm }) {
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setIsSending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employees/${employee.id}/resend-invite`, {
        method: "POST",
        headers: {
          "x-auth-token": token
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend invitation");
      }

      toast.success(`Invitation resent to ${employee.name}`);
      onConfirm();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSending(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resend Invitation</DialogTitle>
          <DialogDescription>
            Are you sure you want to resend the invitation to {employee?.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2 mt-2">
          <CheckCircle2 size={20} className="text-primary" />
          <p className="text-sm">A new invitation email will be sent with a fresh invitation link.</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleResend} disabled={isSending}>
            {isSending ? "Sending..." : "Resend Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Employee Detail Component
export default function EmployeeDetailPage({ params }) {
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const employeeId = params.id;

  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employees/${employeeId}`, {
        headers: {
          "x-auth-token": token
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employee data");
      }

      const data = await response.json();
      setEmployee(data.employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load employee data on mount
  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId]);

  // Handle form save
  const handleSave = (updatedEmployee) => {
    setEmployee(updatedEmployee);
    setIsEditing(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/employees')}
            className="mb-1 -ml-3 text-muted-foreground"
            size="sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Employees
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {isLoading ? "Loading..." : employee?.name}
          </h1>
        </div>
        
        {!isLoading && !isEditing && (
          <div className="flex gap-2">
            {employee?.status === "invited" && (
              <Button onClick={() => setIsInviteDialogOpen(true)} variant="secondary">
                Resend Invitation
              </Button>
            )}
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-8 w-1/3 bg-muted rounded-md"></div>
              <div className="h-8 w-1/2 bg-muted rounded-md"></div>
              <div className="h-8 w-1/4 bg-muted rounded-md"></div>
              <div className="h-8 w-2/3 bg-muted rounded-md"></div>
            </div>
          </CardContent>
        </Card>
      ) : isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Employee Profile</CardTitle>
            <CardDescription>
              Update {employee.name}'s information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeEditForm
              employee={employee}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
              <div className="mt-1">
                <StatusBadge status={employee?.status || "invited"} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <DetailField
                  icon={User}
                  label="Full Name"
                  value={employee?.name}
                />
                <Separator />
                <DetailField
                  icon={Mail}
                  label="Email Address"
                  value={employee?.email}
                />
                <Separator />
                <DetailField
                  icon={Briefcase}
                  label="Position"
                  value={employee?.position}
                />
                <Separator />
                <DetailField
                  icon={Building}
                  label="Department"
                  value={employee?.department}
                />
                <Separator />
                <DetailField
                  icon={Phone}
                  label="Phone Number"
                  value={employee?.phone}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hire Date</p>
                  <p className="font-medium">
                    {employee?.hire_date ? formatDate(employee.hire_date) : "—"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {formatDate(employee?.created_at)}
                  </p>
                </div>
                
                {employee?.status === "invited" && (
                  <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">Invitation Pending</p>
                        <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                          This employee has been invited but has not yet accepted their invitation.
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs mt-2 h-7 px-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                          onClick={() => setIsInviteDialogOpen(true)}
                        >
                          Resend Invitation
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Resend Invitation Dialog */}
      {employee && (
        <ResendInviteDialog
          employee={employee}
          isOpen={isInviteDialogOpen}
          onClose={() => setIsInviteDialogOpen(false)}
          onConfirm={() => fetchEmployeeData()}
        />
      )}
    </>
  );
} 