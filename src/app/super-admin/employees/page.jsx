"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  MoreHorizontal,
  Building,
  Eye,
  Mail,
  User,
  Briefcase,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  BadgeCheck,
  Clock,
  Phone,
  UserCheck,
  UserX,
  Filter,
  UserPlus,
  ChevronDown,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get("organization_id");
  
  const [employees, setEmployees] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("all");
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Build API URL with organization filter and search
        let apiUrl = "/api/employees?include_organization_info=true";
        if (selectedOrganization && selectedOrganization !== "all") {
          apiUrl += `&organization_id=${selectedOrganization}`;
        }
        if (debouncedSearch) {
          apiUrl += `&search=${encodeURIComponent(debouncedSearch)}`;
        }

        // Fetch employees
        const response = await fetch(apiUrl, {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }

        const data = await response.json();
        setEmployees(data.employees || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [selectedOrganization, debouncedSearch, router]);

  // Fetch organizations for filter dropdown
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("/api/organization", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }

        const data = await response.json();
        setOrganizations(data.organizations || []);

        // If we have an organization ID from URL, find its name
        if (orgId && data.organizations) {
          const org = data.organizations.find(o => o.id.toString() === orgId);
          if (org) {
            setOrganizationName(org.name);
          }
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };

    fetchOrganizations();
  }, [orgId]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    if (!status) return { variant: "outline", label: "Unknown" };
    
    const statusLower = status.toLowerCase();
    if (statusLower === "active") {
      return { variant: "success", label: "Active" };
    } else if (statusLower === "invited") {
      return { variant: "warning", label: "Invited" };
    } else if (statusLower === "inactive") {
      return { variant: "destructive", label: "Inactive" };
    } else {
      return { variant: "secondary", label: status };
    }
  };

  // Reset organization filter
  const handleResetFilter = () => {
    setSelectedOrganization("all");
    setOrganizationName("");
    
    // Remove the organization_id query param from URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("organization_id");
    router.replace(newUrl.pathname);
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              {selectedOrganization !== "all"
                ? `Viewing employees for ${organizationName || "selected organization"}`
                : "View all employees across organizations"}
            </p>
          </div>
        </div>
        {selectedOrganization !== "all" && (
          <Button 
            variant="outline" 
            onClick={handleResetFilter}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            All Organizations
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>Employee List</CardTitle>
              <CardDescription>
                {employees.length} employee{employees.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={selectedOrganization} 
                onValueChange={setSelectedOrganization}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        {error ? (
                          <div className="text-destructive">{error}</div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <UserX className="h-8 w-8 text-muted-foreground/60" />
                            <p className="text-muted-foreground">No employees found</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => {
                      const statusBadge = getStatusBadge(employee.status);
                      const statusIcon = employee.status?.toLowerCase() === "active" 
                        ? <UserCheck className="h-3 w-3 mr-1" /> 
                        : <UserX className="h-3 w-3 mr-1" />;
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                {employee.employee_name ? employee.employee_name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <p className="font-medium">{employee.employee_name || "Unnamed"}</p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Mail className="mr-1 h-3 w-3 text-blue-400" />
                                  {employee.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {employee.organization_name ? (
                              <div className="flex items-center space-x-1">
                                <Building className="h-4 w-4 text-purple-500" />
                                <span>{employee.organization_name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="h-4 w-4 text-orange-500" />
                              <span>{employee.role || "No role"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                              {statusIcon}
                              {statusBadge.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-green-500" />
                              <span>
                                {formatDate(employee.joined_date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="flex items-center gap-1">
                                  <User className="h-4 w-4 text-primary" />
                                  Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDetails(employee)} className="flex items-center gap-1">
                                  <Eye className="h-4 w-4 text-blue-500" />
                                  View Details
                                </DropdownMenuItem>
                                {employee.organization_id && (
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/super-admin/organizations/${employee.organization_id}`)}
                                    className="flex items-center gap-1"
                                  >
                                    <Building className="h-4 w-4 text-purple-500" />
                                    View Organization
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <DialogTitle>Employee Details</DialogTitle>
            </div>
            <DialogDescription>
              Detailed information about the employee
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                  {selectedEmployee.employee_name ? selectedEmployee.employee_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="font-semibold text-lg">{selectedEmployee.employee_name || "Unnamed"}</div>
                  <div className="text-muted-foreground text-sm flex items-center gap-1">
                    <Mail className="h-3 w-3 text-blue-400" />
                    {selectedEmployee.email || "No email"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/20 p-4 rounded-md">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Role:</span> {selectedEmployee.role || "-"}
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Status:</span> {selectedEmployee.status || "-"}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Joined:</span> {formatDate(selectedEmployee.joined_date)}
                </div>
                {selectedEmployee.organization_name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Organization:</span> {selectedEmployee.organization_name}
                  </div>
                )}
                {selectedEmployee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Phone:</span> {selectedEmployee.phone}
                  </div>
                )}
                {selectedEmployee.last_active && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">Last Active:</span> {formatDate(selectedEmployee.last_active)}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 