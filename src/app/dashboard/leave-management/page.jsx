"use client";

import { useState, useEffect } from "react";
import { format, parseISO, differenceInDays, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  UserCheck,
  AlertCircle,
  Activity,
  CalendarClock,
  Calendar as CalendarIcon2,
  ArrowRightLeft,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Status badge colors
const getStatusBadge = (status) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "pending":
      return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
    case "cancelled":
      return <Badge variant="secondary">Cancelled</Badge>;
    case "auto_detected":
      return <Badge className="bg-blue-500">Auto Detected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Calculate leave duration
const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const days = differenceInDays(end, start) + 1;
  
  if (days === 1) return format(start, "d MMM yyyy");
  return `${format(start, "d MMM")} - ${format(end, "d MMM yyyy")} (${days} days)`;
};

// Utility to format seconds as 'Xh Ym'
const formatTime = (seconds) => {
  if (!seconds) return "0h 0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

export default function LeaveManagementPage() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [presenceData, setPresenceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Leave action dialog state
  const [leaveActionDialogOpen, setLeaveActionDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
    fetchPresenceData();
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

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
      
      // Set current user's ID as default for employee view
      if (data.employees && data.employees.length > 0) {
        // In a real app, you would get the current user's ID from auth context
        // For this example, we'll use the first employee
        setSelectedLeave(prev => ({ ...prev, employee_id: data.employees[0].id.toString() }));
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/leave-management", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch leave types");

      const data = await response.json();
      setLeaveTypes(data.leaveTypes || []);
      
      // Set first leave type as default
      if (data.leaveTypes && data.leaveTypes.length > 0) {
        setSelectedLeave(prev => ({ ...prev, leave_type_id: data.leaveTypes[0].id.toString() }));
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      let url = "/api/leave-management";
      if (selectedEmployee !== "all") {
        url += `?employee_id=${selectedEmployee}`;
      }

      const response = await fetch(url, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch leave requests");

      const data = await response.json();
      setLeaveRequests(data.leaveRequests || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setIsLoading(false);
    }
  };
  
  const fetchPresenceData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Get recent presence data (last 7 days)
      const today = new Date();
      const lastWeek = addDays(today, -7);
      
      let url = `/api/leave-management/presence?start_date=${format(lastWeek, "yyyy-MM-dd")}&end_date=${format(today, "yyyy-MM-dd")}`;
      
      if (selectedEmployee !== "all") {
        url += `&employee_id=${selectedEmployee}`;
      }

      const response = await fetch(url, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch presence data");

      const data = await response.json();
      setPresenceData(data.presenceRecords || []);
    } catch (error) {
      console.error("Error fetching presence data:", error);
      toast.error("Failed to load presence data");
      setPresenceData([]);
    }
  };

  const handleLeaveAction = async () => {
    if (!selectedLeave || !actionType) return;
    
    // Validate rejection reason if rejecting
    if (actionType === "rejected" && !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      // Show loading state
      toast.loading(`Processing ${actionType} action...`);
      
      const response = await fetch("/api/leave-management", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          id: selectedLeave.id,
          status: actionType,
          approver_id: employees[0]?.id, // In a real app, this would be the current user's ID
          rejection_reason: actionType === "rejected" ? rejectionReason : null,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${actionType} leave request`);
      }
      
      // Clear loading toast and show success
      toast.dismiss();
      
      // Show appropriate success message based on action
      if (actionType === "approved") {
        toast.success(`Leave request approved successfully`);
      } else if (actionType === "rejected") {
        toast.success(`Leave request rejected with reason provided`);
      } else {
        toast.success(`Leave request ${actionType} successfully`);
      }
      
      setLeaveActionDialogOpen(false);
      
      // Update the leave request in the local state to avoid having to refetch
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === selectedLeave.id 
            ? { 
                ...request, 
                status: actionType,
                rejection_reason: actionType === "rejected" ? rejectionReason : request.rejection_reason,
                approved_by: employees[0]?.id,
                approved_at: new Date().toISOString(),
              } 
            : request
        )
      );
      
      // Also refetch to ensure data is synchronized with server
      fetchLeaveRequests();
      
      // Reset
      setSelectedLeave(null);
      setActionType("");
      setRejectionReason("");
      
    } catch (error) {
      toast.dismiss();
      console.error(`Error ${actionType} leave request:`, error);
      toast.error(error.message || `Failed to ${actionType} leave request`);
    }
  };

  const openActionDialog = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setLeaveActionDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">
            Track, and manage employee leaves and absences.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id.toString()}>
                {employee.employee_name || `${employee.first_name || ""} ${employee.last_name || ""}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1"></div>
      </div>

      <div className="space-y-6">
        {/* Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>
              Pending and recent leave requests that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No leave requests</h3>
                <p className="text-muted-foreground">
                  There are no leave requests to review.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        {leave.employee_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: leave.leave_type_color || '#888' }}
                          ></div>
                          <span>{leave.leave_type_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getDateRange(leave.start_date, leave.end_date)}
                      </TableCell>
                      <TableCell>{leave.total_days}</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        {format(new Date(leave.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {(leave.status === "pending" || leave.status === "auto_detected") && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline" 
                              size="sm"
                              className="bg-green-50 hover:bg-green-100 text-green-600"
                              onClick={() => openActionDialog(leave, "approved")}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="outline" 
                              size="sm"
                              className="bg-red-50 hover:bg-red-100 text-red-600"
                              onClick={() => openActionDialog(leave, "rejected")}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Presence Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Presence</CardTitle>
            <CardDescription>
              Monitor employee activity and auto-detected leaves
            </CardDescription>
          </CardHeader>
          <CardContent>
            {presenceData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No presence data</h3>
                <p className="text-muted-foreground">
                  There is no recent presence tracking data available.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active Time</TableHead>
                    <TableHead>First Activity</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presenceData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {record.employee_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {record.status === "present" && <Badge className="bg-green-500">Present</Badge>}
                        {record.status === "absent" && <Badge variant="destructive">Absent</Badge>}
                        {record.status === "half_day" && <Badge className="bg-yellow-500">Half Day</Badge>}
                        {record.status === "leave" && (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-500">On Leave</Badge>
                            {record.leave_type_name && (
                              <span className="text-xs text-muted-foreground">
                                ({record.leave_type_name})
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.active_time || formatTime(record.total_active_seconds || 0)}
                      </TableCell>
                      <TableCell>
                        {record.first_activity ? format(new Date(record.first_activity), "HH:mm") : "N/A"}
                      </TableCell>
                      <TableCell>
                        {record.last_activity ? format(new Date(record.last_activity), "HH:mm") : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button 
              variant="outline" 
              onClick={fetchPresenceData}
              className="ml-auto"
            >
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Leave Action Dialog */}
      <Dialog open={leaveActionDialogOpen} onOpenChange={setLeaveActionDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved" ? "Approve Leave Request" : 
               actionType === "rejected" ? "Reject Leave Request" : "Confirm Action"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approved" ? 
                "Approving this request will mark it as approved and adjust the employee's leave balance." :
               actionType === "rejected" ? 
                "Please provide a reason for rejecting this leave request. The employee will be notified." :
                "Confirm the action for this leave request."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedLeave && (
              <div className="grid gap-4">
                <div className="rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="font-medium">Employee:</div>
                    <div className="font-semibold">{selectedLeave.employee_name}</div>
                    
                    <div className="font-medium">Leave Type:</div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: selectedLeave.leave_type_color || '#888' }}
                      ></div>
                      <span className="font-semibold">{selectedLeave.leave_type_name}</span>
                    </div>
                    
                    <div className="font-medium">Date Range:</div>
                    <div className="font-semibold">{getDateRange(selectedLeave.start_date, selectedLeave.end_date)}</div>
                    
                    <div className="font-medium">Total Days:</div>
                    <div className="font-semibold">{selectedLeave.total_days}</div>
                    
                    <div className="font-medium">Current Status:</div>
                    <div>{getStatusBadge(selectedLeave.status)}</div>
                    
                    <div className="font-medium">Reason for Leave:</div>
                    <div className="font-semibold">{selectedLeave.reason || "No reason provided"}</div>
                  </div>
                </div>
                
                {actionType === "approved" && (
                  <div className="mt-2 text-sm rounded-md bg-green-50 p-3 border border-green-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-green-800">Approval Information</p>
                        <p className="text-green-700 mt-1">
                          Approving this leave request will reduce the employee's available leave balance
                          and mark the days as "On Leave" in the presence tracking system.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {actionType === "rejected" && (
                  <>
                    <div className="mt-2 text-sm rounded-md bg-red-50 p-3 border border-red-200">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-red-800">Rejection Information</p>
                          <p className="text-red-700 mt-1">
                            The employee will be notified of this rejection with the reason you provide below.
                            Their leave balance will not be affected.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Label htmlFor="rejectionReason" className="text-red-600 font-medium">
                        Rejection Reason <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="rejectionReason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a detailed reason for rejection"
                        className="mt-1 border-red-300 focus:border-red-500"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeaveActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleLeaveAction} 
              className={
                actionType === "approved" ? "bg-green-600 hover:bg-green-700" : 
                actionType === "rejected" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {actionType === "approved" ? "Approve Leave" : 
               actionType === "rejected" ? "Reject Leave" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 