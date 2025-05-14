"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  User,
  Users,
  ArrowUpDown,
  ChevronDown,
  Download,
  Loader2,
  Mail,
  Trash
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { InviteEmployeeDialog } from "./invite-dialog";

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const itemsPerPage = 10;
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, activeTab, searchQuery, departmentFilter]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employees", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data.employees || []);
      
      // Extract unique departments
      const uniqueDepartments = [...new Set(data.employees.map(emp => emp.department))].filter(Boolean);
      setDepartments(uniqueDepartments);
      
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Filter by status (tab)
    if (activeTab !== "all") {
      if (activeTab === "active") {
        // Include both "active" and "activated" statuses
        filtered = filtered.filter((employee) => 
          employee.status === "active" || employee.status === "activated"
        );
      } else {
        filtered = filtered.filter((employee) => employee.status === activeTab);
      }
    }

    // Debug statuses to console
    console.log("Available statuses:", [...new Set(employees.map(e => e.status))]);

    // Filter by search query (name or email)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          (employee.employee_name && employee.employee_name.toLowerCase().includes(query)) ||
          (employee.first_name && employee.first_name.toLowerCase().includes(query)) ||
          (employee.last_name && employee.last_name.toLowerCase().includes(query)) ||
          (employee.email && employee.email.toLowerCase().includes(query))
      );
    }

    // Filter by department
    if (departmentFilter && departmentFilter !== "all") {
      filtered = filtered.filter((employee) => employee.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
    
    // Calculate total pages
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
    
    // Reset to first page when filters change
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  const getPaginatedEmployees = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case "activated":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case "invited":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            <Mail className="w-3 h-3 mr-1" /> Invited
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600">
            {status}
          </Badge>
        );
    }
  };

  const handleExportCSV = () => {
    // Set loading state
    setIsExporting(true);
    
    try {
      // Create CSV content
      const headers = ['ID', 'Name', 'Email', 'Position', 'Department', 'Status', 'Joined Date'];
      
      // Use all employees, not just filtered ones, to include all statuses
      const csvRows = [
        headers.join(','), // Header row
        ...employees.map(employee => {
          // Format employee data for CSV
          const name = employee.employee_name || 
            `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
          const joinDate = employee.hire_date || employee.created_at || '';
          const formattedDate = joinDate ? new Date(joinDate).toLocaleDateString() : 'N/A';
          
          // Quote values to handle commas in text
          const values = [
            employee.id || '',
            `"${name}"`,
            `"${employee.email || ''}"`,
            `"${employee.position || employee.role || ''}"`,
            `"${employee.department || employee.team_name || ''}"`,
            `"${employee.status || ''}"`,
            `"${formattedDate}"`
          ];
          
          return values.join(',');
        })
      ];
      
      // Join all rows with newlines
      const csvContent = csvRows.join('\n');
      
      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `trackpro_employees_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.display = 'none';
      
      // Add link to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the URL to free up memory
      URL.revokeObjectURL(url);
      
      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export employee data");
    } finally {
      // Reset loading state
      setIsExporting(false);
    }
  };

  const handleInviteEmployee = () => {
    setInviteDialogOpen(true);
  };

  const handleViewEmployee = (id) => {
    router.push(`/dashboard/employees/${id}`);
  };

  const handleResendInvite = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employees/${id}/resend-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend invitation");
      }

      toast.success("Invitation resent successfully");
    } catch (error) {
      console.error("Error resending invitation:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete employee");
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      toast.success("Employee deleted successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Employees
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's employees
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="md:hidden"
            onClick={handleExportCSV}
            disabled={isExporting}
            size="icon"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          </Button>
          <Button onClick={handleInviteEmployee}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Employee
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-wrap justify-between items-center p-6 pb-3">
              <TabsList>
                <TabsTrigger value="all" className="gap-1">
                  <Users className="h-4 w-4" /> All
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Active
                </TabsTrigger>
                <TabsTrigger value="invited" className="gap-1">
                  <Mail className="h-4 w-4" /> Invited
                </TabsTrigger>
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                className="px-2.5 hidden md:flex"
                onClick={handleExportCSV}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>

            <CardContent className="p-6 pt-3">
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="flex-1 text-left">
                        {departmentFilter || "Department"}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <TabsContent value="all" className="m-0">
                <EmployeesTable
                  employees={getPaginatedEmployees()}
                  isLoading={isLoading}
                  getInitials={getInitials}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  handleViewEmployee={handleViewEmployee}
                  handleResendInvite={handleResendInvite}
                  handleDeleteEmployee={handleDeleteEmployee}
                />
              </TabsContent>
              <TabsContent value="active" className="m-0">
                <EmployeesTable
                  employees={getPaginatedEmployees()}
                  isLoading={isLoading}
                  getInitials={getInitials}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  handleViewEmployee={handleViewEmployee}
                  handleResendInvite={handleResendInvite}
                  handleDeleteEmployee={handleDeleteEmployee}
                />
              </TabsContent>
              <TabsContent value="invited" className="m-0">
                <EmployeesTable
                  employees={getPaginatedEmployees()}
                  isLoading={isLoading}
                  getInitials={getInitials}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  handleViewEmployee={handleViewEmployee}
                  handleResendInvite={handleResendInvite}
                  handleDeleteEmployee={handleDeleteEmployee}
                />
              </TabsContent>

              {filteredEmployees.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{getPaginatedEmployees().length}</span> of{" "}
                    <span className="font-medium">{filteredEmployees.length}</span> employees
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              href="#" 
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      {totalPages > 5 && currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationLink 
                            href="#" 
                            onClick={() => setCurrentPage(totalPages)}
                            isActive={currentPage === totalPages}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>

      <InviteEmployeeDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen} 
      />
    </div>
  );
}

function EmployeesTable({
  employees,
  isLoading,
  getInitials,
  formatDate,
  getStatusBadge,
  handleViewEmployee,
  handleResendInvite,
  handleDeleteEmployee,
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading employees...</span>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">No employees found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Employee</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={employee.avatar_url} alt={`${employee.first_name} ${employee.last_name}`} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(employee.first_name, employee.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{`${employee.first_name} ${employee.last_name}`}</div>
                    <div className="text-sm text-muted-foreground">{employee.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{employee.position || "—"}</TableCell>
              <TableCell>{employee.department || "—"}</TableCell>
              <TableCell>{getStatusBadge(employee.status)}</TableCell>
              <TableCell>{formatDate(employee.hire_date)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleViewEmployee(employee.id)}>
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    {employee.status === "invited" && (
                      <DropdownMenuItem onClick={() => handleResendInvite(employee.id)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Invite
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDeleteEmployee(employee.id)}>
                      <Trash className="h-4 w-4 mr-2 text-destructive" />
                      <span className="text-destructive">Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 