"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, 
  Search, 
  UserPlus, 
  AlertCircle, 
  Calendar, 
  Building, 
  Briefcase, 
  Phone, 
  Trash2, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

// Employee Table Component
function EmployeeTable({ employees, onDelete, isLoading }) {
  const router = useRouter();

  const handleRowClick = (employeeId) => {
    router.push(`/dashboard/employees/${employeeId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse flex flex-col gap-4 w-full">
          <div className="h-12 bg-muted rounded"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No employees found</h3>
        <p className="text-muted-foreground mb-6">
          Add your first employee by clicking the "Invite Employee" button above.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead className="hidden md:table-cell">Department</TableHead>
            <TableHead className="hidden lg:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Hire Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(employee.id)}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-xs text-muted-foreground">{employee.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{employee.position || "—"}</TableCell>
              <TableCell className="hidden md:table-cell">{employee.department || "—"}</TableCell>
              <TableCell className="hidden lg:table-cell">
                <StatusBadge status={employee.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                  >
                    <ExternalLink size={14} />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => onDelete(employee.id, employee.name)}
                  >
                    <Trash2 size={14} />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Replace the InviteEmployeeDialog component with a link to the new invite page
function InviteEmployeeButton() {
  const router = useRouter();
  
  return (
    <Button onClick={() => router.push('/dashboard/employees/invite')} className="gap-2">
      <UserPlus size={16} />
      <span>Invite Employee</span>
    </Button>
  );
}

// Delete Confirmation Dialog
function DeleteConfirmationDialog({ employeeId, employeeName, isOpen, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete employee");
      }

      toast.success(`${employeeName} was deleted successfully`);
      onConfirm();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Employee</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {employeeName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2 mt-2">
          <AlertCircle size={20} className="text-destructive" />
          <p className="text-sm">All data associated with this employee will be permanently removed.</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}

// Main Page Component
export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    employeeId: null,
    employeeName: ""
  });
  
  // Check for invitation acceptance
  const invitationAccepted = searchParams.get('invitation') === 'accepted';
  const [showInviteSuccess, setShowInviteSuccess] = useState(invitationAccepted);
  const [acceptedEmployee, setAcceptedEmployee] = useState(null);
  
  // Function to fetch employees
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch('http://localhost:3000/api/employees')
      
      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      // Handle different response formats
      if (data.data) {
        // New API format
        setEmployees(data.data);
        setTotalPages(1); // Default to 1 page if pagination not provided
      } else if (data.employees) {
        // Old API format
        setEmployees(data.employees);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        // Fallback if unexpected format
        setEmployees([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error(`Error: ${error.message}`);
      setEmployees([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for accepted employee data in localStorage
  useEffect(() => {
    // Check for invitation parameter and localStorage data
    if (invitationAccepted) {
      try {
        const storedEmployee = localStorage.getItem('accepted_employee');
        if (storedEmployee) {
          setAcceptedEmployee(JSON.parse(storedEmployee));
          // Clear the data after reading it
          localStorage.removeItem('accepted_employee');
        }
      } catch (error) {
        console.error("Error parsing accepted employee data:", error);
      }
      
      // Auto-hide the success message after 8 seconds
      const timer = setTimeout(() => {
        setShowInviteSuccess(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [invitationAccepted]);

  // Initial load and when search/page changes
  useEffect(() => {
    fetchEmployees();
  }, [page, searchTerm]);

  // Handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  // Handle delete confirmation
  const handleDeleteClick = (id, name) => {
    setDeleteDialog({
      isOpen: true,
      employeeId: id,
      employeeName: name
    });
  };

  // Handle successful delete
  const handleDeleteSuccess = () => {
    fetchEmployees();
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Employees</h1>
        <p className="text-muted-foreground">
          Manage your organization's employees and send invitations.
        </p>
      </div>
      
      {/* Invitation success message */}
      {showInviteSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Invitation Accepted!</AlertTitle>
          <AlertDescription>
            {acceptedEmployee ? (
              <>
                <span className="font-medium">{acceptedEmployee.name}</span> has successfully joined 
                <span className="font-medium"> {acceptedEmployee.organization}</span>. They can now access 
                the system with full employee capabilities.
              </>
            ) : (
              'Employee invitation has been successfully accepted.'
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="w-full md:w-64">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
        </div>
        <InviteEmployeeButton />
      </div>
      
      <Card>
        <CardContent className="p-0">
          <EmployeeTable
            employees={employees}
            onDelete={handleDeleteClick}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
      
      <DeleteConfirmationDialog
        employeeId={deleteDialog.employeeId}
        employeeName={deleteDialog.employeeName}
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
        onConfirm={handleDeleteSuccess}
      />
    </>
  );
} 