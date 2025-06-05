"use client";

import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Calendar as CalendarIcon, Loader2, AlertCircle, Plane, ClipboardEdit, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function ApplyLeavePage() {
  // Placeholder employee_id (replace with real value from context/auth in production)
  const employeeId = 1;

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true);

  // Leave types state
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypesLoading, setLeaveTypesLoading] = useState(true);
  const [leaveTypesError, setLeaveTypesError] = useState(null);

  // Form state
  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: "", // will be set after fetching leave types
    start_date: new Date(),
    end_date: new Date(),
    reason: ""
  });

  // Fetch leave types on mount
  useEffect(() => {
    async function fetchLeaveTypes() {
      setLeaveTypesLoading(true);
      setLeaveTypesError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/leave-management", {
          headers: { "x-auth-token": token }
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to fetch leave types");
        setLeaveTypes(data.leaveTypes || []);
        // Set default leave type to first one
        if (data.leaveTypes && data.leaveTypes.length > 0) {
          setLeaveForm(prev => ({ ...prev, leave_type_id: data.leaveTypes[0].id }));
        }
      } catch (err) {
        setLeaveTypesError(err.message || "Failed to fetch leave types");
      } finally {
        setLeaveTypesLoading(false);
      }
    }
    fetchLeaveTypes();
  }, []);

  // Calculate total days for leave request
  const calculateDays = () => {
    if (!leaveForm.start_date || !leaveForm.end_date) return 0;
    return differenceInDays(leaveForm.end_date, leaveForm.start_date) + 1;
  };

  // Handle leave form submission
  const handleSubmitLeave = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      toast.error("Employee information not found");
      return;
    }

    if (!leaveForm.leave_type_id || !leaveForm.start_date || !leaveForm.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // Calculate total days
      const totalDays = calculateDays();

      // Prepare request data
      const requestData = {
        employee_id: employeeId,
        leave_type_id: leaveForm.leave_type_id, // now numeric
        start_date: format(leaveForm.start_date, "yyyy-MM-dd"),
        end_date: format(leaveForm.end_date, "yyyy-MM-dd"),
        total_days: totalDays,
        reason: leaveForm.reason || ""
      };

      // Send request to API
      const response = await fetch("/api/leave-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit leave request");
      }

      toast.success("leave application sent");

      // Reset form but keep it visible
      setLeaveForm({
        leave_type_id: leaveTypes.length > 0 ? leaveTypes[0].id : "",
        start_date: new Date(),
        end_date: new Date(),
        reason: ""
      });
    } catch (err) {
      console.error("Error submitting leave request:", err);
      toast.error(err.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading/error state for leave types
  if (leaveTypesLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading leave types...
      </div>
    );
  }
  if (leaveTypesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{leaveTypesError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Plane className="h-8 w-8 text-primary" />
          Apply Leave
        </h1>
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardEdit className="h-5 w-5 text-blue-500" />
              Request Leave
            </CardTitle>
            <CardDescription>Fill in the details to apply for leave</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4 text-primary" />
                    Leave Type
                  </Label>
                  <Select 
                    value={String(leaveForm.leave_type_id)}
                    onValueChange={(value) => setLeaveForm(prev => ({ ...prev, leave_type_id: Number(value) }))}
                  >
                    <SelectTrigger id="leaveType" className="w-full">
                      <SelectValue placeholder="Select leave type">
                        {leaveTypes.find(type => type.id === leaveForm.leave_type_id)?.name || "Select leave type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromDate" className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    From Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="fromDate"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {leaveForm.start_date ? (
                          format(leaveForm.start_date, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={leaveForm.start_date}
                        onSelect={(date) => {
                          if (!date) return;
                          setLeaveForm(prev => ({
                            ...prev,
                            start_date: date,
                            end_date: date > prev.end_date ? date : prev.end_date
                          }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toDate" className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    To Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="toDate"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {leaveForm.end_date ? (
                          format(leaveForm.end_date, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={leaveForm.end_date}
                        onSelect={(date) => {
                          if (!date) return;
                          setLeaveForm(prev => ({ ...prev, end_date: date }));
                        }}
                        disabled={(date) => date < leaveForm.start_date}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {leaveForm.start_date && leaveForm.end_date && (
                <div className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Leave Duration: {calculateDays()} day(s)
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-1">
                  <ClipboardEdit className="h-4 w-4 text-blue-500" />
                  Reason for Leave
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a reason for your leave request"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex items-center gap-2">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 