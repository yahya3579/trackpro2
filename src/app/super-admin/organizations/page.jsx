"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Building,
  MoreHorizontal,
  Search,
  Plus,
  Users,
  Eye,
  Calendar,
  Mail,
  Shield,
  Key,
  Briefcase,
  UserPlus,
  Globe,
  BookOpen,
  PenTool,
  ChevronLeft,
  ChevronRight,
  Server,
  RefreshCw,
  AlertCircle,
  Activity,
  Clock,
  BuildingIcon
} from "lucide-react";

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // New organization form state
  const [newOrg, setNewOrg] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchOrganizations = async (page = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : "";
      const response = await fetch(
        `/api/organization?page=${page}&limit=${pagination.limit}${searchParam}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }

      const data = await response.json();
      setOrganizations(data.organizations || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations(pagination.page, search);
  }, [pagination.page]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrganizations(1, search);
  };

  // Handle create organization
  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setFormError("");
    
    // Validate form
    if (!newOrg.name || !newOrg.email || !newOrg.password) {
      setFormError("All fields are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(newOrg),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create organization");
      }

      // Close dialog and reset form
      setIsDialogOpen(false);
      setNewOrg({ name: "", email: "", password: "" });
      
      // Refresh organizations list
      fetchOrganizations(1, search);
    } catch (err) {
      console.error("Error creating organization:", err);
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    if (pagination.totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= pagination.totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={pagination.page === i}
              onClick={() => setPagination({ ...pagination, page: i })}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: 1 })}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Calculate range
      let startPage = Math.max(2, pagination.page - 1);
      let endPage = Math.min(pagination.totalPages - 1, pagination.page + 1);
      
      // Adjust if at the beginning
      if (pagination.page <= 2) {
        endPage = Math.min(4, pagination.totalPages - 1);
      }
      
      // Adjust if at the end
      if (pagination.page >= pagination.totalPages - 1) {
        startPage = Math.max(2, pagination.totalPages - 3);
      }
      
      // Show ellipsis if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Show middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={pagination.page === i}
              onClick={() => setPagination({ ...pagination, page: i })}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // Show ellipsis if needed
      if (endPage < pagination.totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      
      // Show last page
      if (pagination.totalPages > 1) {
        items.push(
          <PaginationItem key={pagination.totalPages}>
            <PaginationLink
              isActive={pagination.page === pagination.totalPages}
              onClick={() => setPagination({ ...pagination, page: pagination.totalPages })}
            >
              {pagination.totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    return items;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BuildingIcon className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              Manage all registered organizations in the system
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <DialogTitle>Create New Organization</DialogTitle>
              </div>
              <DialogDescription>
                Add a new organization to the system
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrganization}>
              {formError && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  {formError}
                </div>
              )}
              <div className="space-y-4 py-2 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Organization Name
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter organization name"
                      className="pl-10"
                      value={newOrg.name}
                      onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="admin@organization.com"
                      value={newOrg.email}
                      onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    Password
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      placeholder="Create a secure password"
                      value={newOrg.password}
                      onChange={(e) => setNewOrg({ ...newOrg, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex items-center gap-2"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isSubmitting ? "Creating..." : "Create Organization"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-500" />
            <div>
              <CardTitle>Organization List</CardTitle>
              <CardDescription>
                Total of {pagination.total || 0} organizations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <form onSubmit={handleSearch} className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
            <Button variant="outline" onClick={() => fetchOrganizations(1, search)} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          {error ? (
                            <div className="text-destructive flex items-center justify-center gap-2">
                              <AlertCircle className="h-5 w-5 text-destructive" />
                              {error}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Building className="h-8 w-8 text-muted-foreground/60" />
                              <p className="text-muted-foreground">No organizations found</p>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      organizations.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {org.photoUrl ? (
                                <img
                                  src={org.photoUrl}
                                  alt={org.name}
                                  className="h-10 w-10 rounded-full border object-cover bg-muted"
                                  style={{ minWidth: 40, minHeight: 40 }}
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg border">
                                  {org.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{org.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4 text-blue-500" />
                              {org.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-500" />
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <UserPlus className="h-3 w-3" />
                                {org.employeeCount}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-orange-500" />
                              <span>{formatDate(org.createdAt)}</span>
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
                                  <Building className="h-4 w-4 text-primary" />
                                  Actions
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push(`/super-admin/organizations/${org.id}`)} className="flex items-center gap-1">
                                  <Eye className="h-4 w-4 text-blue-500" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/super-admin/employees?organization_id=${org.id}`)} className="flex items-center gap-1">
                                  <Users className="h-4 w-4 text-green-500" />
                                  View Employees
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {organizations.length > 0 && pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            if (pagination.page > 1) {
                              setPagination({ ...pagination, page: pagination.page - 1 });
                            }
                          }}
                          disabled={pagination.page === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </PaginationPrevious>
                      </PaginationItem>
                      
                      {renderPaginationItems()}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            if (pagination.page < pagination.totalPages) {
                              setPagination({ ...pagination, page: pagination.page + 1 });
                            }
                          }}
                          disabled={pagination.page === pagination.totalPages}
                          className="flex items-center gap-1"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </PaginationNext>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 