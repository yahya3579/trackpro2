"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function InviteEmployeeDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    role: "",
    teamName: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!formData.name || !formData.email || !formData.role || !formData.teamName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employees/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ 
          users: [{
            name: formData.name,
            email: formData.email,
            employeeId: formData.employeeId,
            role: formData.role,
            teams: [{ teamName: formData.teamName }]
          }] 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to invite employee");
      }

      toast.success("Employee invited successfully");
      onOpenChange(false); // Close the dialog
      
      // Reset form data
      setFormData({
        name: "",
        email: "",
        employeeId: "",
        role: "",
        teamName: ""
      });
    } catch (error) {
      console.error("Error inviting employee:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl">Add New Employee</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1">
              Employee Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter employee name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1">
              Employee Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="Enter employee email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1">
              Employee ID <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
            </label>
            <Input
              placeholder="Enter Employee Id"
              value={formData.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Team Member">Team Member</SelectItem>
              </SelectContent>
            </Select>
            {!formData.role && (
              <p className="text-xs text-red-500 mt-1">Required</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Team Name <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.teamName}
              onValueChange={(value) => handleChange("teamName", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Team..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Design Team">Design Team</SelectItem>
                <SelectItem value="Development Team">Development Team</SelectItem>
                <SelectItem value="HR Team">HR Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-muted/30 -mx-6 px-6 py-4 mt-4 text-sm text-muted-foreground">
          <div className="mb-2">
            <strong>Team Member</strong> is a person who you want to be monitored
          </div>
          <div>
            <strong>Admin</strong> has the control of everything from adding a member, creating a team, seeing the tracking data
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add & Invite User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 