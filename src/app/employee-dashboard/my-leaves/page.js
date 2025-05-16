"use client";

import { useState, useEffect } from "react";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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

export default function MyLeavesPage() {
  // State
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveBalances();
  }, []);

  // Fetch employee's leave requests
  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await fetch("/api/leave-management", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }

      const data = await response.json();
      setLeaveRequests(data.leaveRequests || []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      toast.error("Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employee's leave balances
  const fetchLeaveBalances = async () => {
    setIsLoadingBalances(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/leave-management/balances", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leave balances");
      }

      const data = await response.json();
      setLeaveBalances(data.leaveBalances || []);
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      toast.error("Failed to load leave balances");
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Cancel a leave request
  const cancelLeaveRequest = async (leaveId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      toast.loading("Cancelling leave request...");

      const response = await fetch("/api/leave-management", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          id: leaveId,
          status: "cancelled",
          approver_id: null, // Employee is cancelling their own request
        }),
      });

      const data = await response.json();

      toast.dismiss();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel leave request");
      }

      toast.success("Leave request cancelled successfully");
      fetchLeaveRequests(); // Refresh the list
    } catch (error) {
      toast.dismiss();
      console.error("Error cancelling leave request:", error);
      toast.error(error.message || "Failed to cancel leave request");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Leaves</h1>
        <Button onClick={() => window.location.href = "/employee-dashboard/apply-leave"}>
          Request Leave
        </Button>
      </div>

      {/* Leave Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
          <CardDescription>Your current leave balances for this year</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBalances ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leaveBalances.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No leave balance information available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaveBalances.map((balance) => (
                <Card key={balance.id} className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: balance.leave_type_color || "#888" }}
                        ></div>
                        <span className="font-medium">{balance.leave_type_name}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-3xl font-bold">
                      {balance.remaining} <span className="text-sm font-normal text-muted-foreground">days remaining</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {balance.used} used of {balance.total_entitled} total
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>Your leave requests and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leaveRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No leave requests</h3>
              <p className="text-muted-foreground">
                You haven't submitted any leave requests yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: leave.leave_type_color || "#888" }}
                        ></div>
                        <span>{leave.leave_type_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getDateRange(leave.start_date, leave.end_date)}</TableCell>
                    <TableCell>{leave.total_days}</TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell>{format(new Date(leave.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {leave.status === "rejected" && (
                        <span className="text-red-500 text-sm">
                          {leave.rejection_reason || "No reason provided"}
                        </span>
                      )}
                      {leave.status === "approved" && (
                        <span className="text-green-500 text-sm">
                          Approved by {leave.approved_by_name
                            ? `${leave.approved_by_name} (ID: ${leave.approved_by})`
                            : "Admin"}
                        </span>
                      )}
                      {leave.status === "pending" && (
                        <span className="text-yellow-500 text-sm">Awaiting response</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {leave.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 hover:bg-red-50 text-red-500"
                          onClick={() => cancelLeaveRequest(leave.id)}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 