"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  ArrowUpDown,
  Info
} from "lucide-react";

export default function LeaveRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [organizationFilter, setOrganizationFilter] = useState("");
  const [adminId, setAdminId] = useState(1); // Placeholder for admin ID

  // Sample organizations for the filter
  const organizations = [
    { id: 1, name: "Tech Solutions Inc." },
    { id: 2, name: "Marketing Experts LLC" },
    { id: 3, name: "Finance Group" },
  ];

  useEffect(() => {
    // Fetch leave requests from API
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        
        // Add authentication token
        const response = await fetch('/api/leave-management', {
          headers: {
            'x-auth-token': 'token' // Add a placeholder token
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch leave requests');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setLeaveRequests(data.leaveRequests);
          setLeaveTypes(data.leaveTypes || []);
        } else {
          throw new Error(data.error || 'Failed to fetch leave requests');
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        // Use mock data as fallback if API fails
        setLeaveRequests([
          { 
            id: 1, 
            employee_name: "John Smith", 
            employee_id: 101,
            organization: "Tech Solutions Inc.",
            leave_type_name: "Sick Leave", 
            start_date: "2023-11-15", 
            end_date: "2023-11-16", 
            total_days: 2,
            status: "pending", 
            reason: "Not feeling well",
          },
          { 
            id: 2, 
            employee_name: "Sarah Johnson", 
            employee_id: 102,
            organization: "Tech Solutions Inc.",
            leave_type_name: "Vacation", 
            start_date: "2023-11-20", 
            end_date: "2023-11-24", 
            total_days: 5,
            status: "pending", 
            reason: "Family vacation",
          },
        ]);
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    // Filter leave requests based on search term and filters
    filterRequests();
  }, [leaveRequests, searchTerm, statusFilter, typeFilter, organizationFilter]);

  const filterRequests = () => {
    const filtered = leaveRequests.filter((request) => {
      const matchesSearch = request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (request.reason && request.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || statusFilter === "all_statuses" ? true : request.status === statusFilter;
      const matchesType = !typeFilter || typeFilter === "all_types" ? true : request.leave_type_name === typeFilter;
      const matchesOrganization = !organizationFilter || organizationFilter === "all_organizations" ? true : request.organization === organizationFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesOrganization;
    });
    
    setFilteredRequests(filtered);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/leave-management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': 'token'
        },
        body: JSON.stringify({
          id,
          status: 'approved',
          approver_id: adminId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve leave request');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update the local state
        const updatedRequests = leaveRequests.map((request) => 
          request.id === id ? { ...request, status: "approved" } : request
        );
        setLeaveRequests(updatedRequests);
      } else {
        throw new Error(data.error || 'Failed to approve leave request');
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error approving leave request:", error);
      // Fallback to optimistic update if API fails
      const updatedRequests = leaveRequests.map((request) => 
        request.id === id ? { ...request, status: "approved" } : request
      );
      setLeaveRequests(updatedRequests);
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/leave-management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': 'token'
        },
        body: JSON.stringify({
          id,
          status: 'rejected',
          approver_id: adminId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject leave request');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update the local state
        const updatedRequests = leaveRequests.map((request) => 
          request.id === id ? { ...request, status: "rejected" } : request
        );
        setLeaveRequests(updatedRequests);
      } else {
        throw new Error(data.error || 'Failed to reject leave request');
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error rejecting leave request:", error);
      // Fallback to optimistic update if API fails
      const updatedRequests = leaveRequests.map((request) => 
        request.id === id ? { ...request, status: "rejected" } : request
      );
      setLeaveRequests(updatedRequests);
      setLoading(false);
    }
  };

  // Function to format the date range
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options = { month: 'short', day: 'numeric' };
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', options);
    }
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { day: 'numeric' })} - ${end.toLocaleDateString('en-US', options)}`;
    }
    
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'rejected':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "";
    }
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!filteredRequests.length) return;
    const headers = [
      "ID",
      "Employee Name",
      "Organization",
      "Leave Type",
      "Start Date",
      "End Date",
      "Total Days",
      "Status",
      "Reason"
    ];
    const rows = filteredRequests.map(req => [
      req.id,
      `"${(req.employee_name || '').replace(/"/g, '""')}"`,
      `"${(req.organization || '').replace(/"/g, '""')}"`,
      `"${(req.leave_type_name || '').replace(/"/g, '""')}"`,
      req.start_date,
      req.end_date,
      req.total_days,
      req.status,
      `"${(req.reason || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leave_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
        <Button variant="outline" onClick={handleExportCSV}>Export Data</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            Review and manage employee leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee or reason"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_types">All Types</SelectItem>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No leave requests found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try changing your search or filters
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {request.avatarUrl ? (
                              <AvatarImage src={request.avatarUrl} alt={request.employee_name} />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(request.employee_name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-medium">{request.employee_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{request.organization || "Not specified"}</TableCell>
                      <TableCell>{request.leave_type_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{formatDateRange(request.start_date, request.end_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{request.total_days} {request.total_days === 1 ? "day" : "days"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(request.status)}
                        >
                          {request.status === "approved" 
                            ? "Approved" 
                            : request.status === "rejected" 
                            ? "Rejected" 
                            : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={request.reason}>
                          {request.reason || "No reason provided"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" && (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-green-600"
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-red-600"
                              onClick={() => handleReject(request.id)}
                            >
                              <XCircle className="h-4 w-4" />
                              <span className="sr-only">Reject</span>
                            </Button>
                          </div>
                        )}
                        {request.status !== "pending" && (
                          <div className="text-xs text-muted-foreground">
                            {request.approved_at ? new Date(request.approved_at).toLocaleDateString() : "—"}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 