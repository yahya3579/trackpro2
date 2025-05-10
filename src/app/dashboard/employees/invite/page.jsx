"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  User, 
  Briefcase, 
  Building, 
  Phone,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InviteEmployeePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invitedEmployee, setInvitedEmployee] = useState(null);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position: "",
    department: "",
    phone: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employees/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to invite employee");
      }

      setInvitedEmployee(data.employee);
      setShowSuccess(true);
      toast.success(`${formData.first_name} ${formData.last_name} was invited successfully!`);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInviteAnother = () => {
    setShowSuccess(false);
    setInvitedEmployee(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      position: "",
      department: "",
      phone: ""
    });
  };

  const departments = [
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
    "Finance",
    "Human Resources",
    "Operations",
    "Analytics",
    "Support"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/employees')}
          className="mb-1 -ml-3 text-muted-foreground"
          size="sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Employees
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Invite Employee</h1>
        <p className="text-muted-foreground">
          Send an invitation to a new employee to join your organization.
        </p>
      </div>

      {!showSuccess ? (
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Employee Details</CardTitle>
              <CardDescription>
                Enter the details of the employee you want to invite.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="John"
                        required
                      />
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Doe"
                        required
                      />
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="john.doe@example.com"
                      required
                    />
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium">
                    Position <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Software Engineer"
                      required
                    />
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleSelectChange("department", value)}
                    required
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="+1 234 567 890"
                    />
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="space-y-6">
            <BackgroundGradient className="rounded-[22px] p-4 sm:p-10 bg-white dark:bg-zinc-900">
              <div className="px-2 py-5">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-200 mb-4">Why Invite Employees?</h3>
                <ul className="space-y-4">
                  {[
                    "Track time and activities",
                    "Monitor project progress",
                    "Enable self-reporting",
                    "Improve team collaboration",
                    "Simplify attendance tracking"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center">
                        <CheckCircle className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BackgroundGradient>

            <Card className="border-muted/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Employees will receive an email with a link to accept their invitation. The link is valid for 7 days.
                </p>
                <p className="mt-3">
                  They will appear in your employee list with "Invited" status until they accept the invitation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Invitation Sent!</CardTitle>
            <CardDescription className="text-center text-base pt-2">
              <TextGenerateEffect words={`The invitation email has been sent to ${invitedEmployee?.first_name} ${invitedEmployee?.last_name} successfully.`} />
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium">Invited Employee</p>
                <p className="text-muted-foreground">{invitedEmployee?.first_name} {invitedEmployee?.last_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email Address</p>
                <p className="text-muted-foreground">{invitedEmployee?.email}</p>
              </div>
              {invitedEmployee?.position && (
                <div>
                  <p className="text-sm font-medium">Position</p>
                  <p className="text-muted-foreground">{invitedEmployee.position}</p>
                </div>
              )}
              {invitedEmployee?.department && (
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-muted-foreground">{invitedEmployee.department}</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-400 font-medium">What happens next?</p>
                <p className="text-xs text-blue-700 dark:text-blue-500 mt-1">
                  {invitedEmployee?.first_name} will receive an email with a link to accept the invitation. 
                  Once accepted, their status will change from "Invited" to "Active".
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/employees')}
            >
              View Employees
            </Button>
            <Button onClick={handleInviteAnother}>
              Invite Another Employee
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 