"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Calendar as CalendarIcon, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ApplyLeavePage() {
  const [date, setDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 3))
  });
  
  // Mock leave history
  const leaveHistory = [
    { 
      id: 1, 
      type: 'Annual Leave', 
      from: '2023-05-10', 
      to: '2023-05-15', 
      days: 4, 
      reason: 'Vacation', 
      status: 'approved' 
    },
    { 
      id: 2, 
      type: 'Sick Leave', 
      from: '2023-04-03', 
      to: '2023-04-04', 
      days: 2, 
      reason: 'Not feeling well', 
      status: 'approved' 
    },
    { 
      id: 3, 
      type: 'Annual Leave', 
      from: '2023-03-20', 
      to: '2023-03-22', 
      days: 3, 
      reason: 'Family event', 
      status: 'approved' 
    },
    { 
      id: 4, 
      type: 'Annual Leave', 
      from: '2023-07-10', 
      to: '2023-07-12', 
      days: 3, 
      reason: 'Personal trip', 
      status: 'pending' 
    }
  ];
  
  // Filter leave history
  const pendingLeaves = leaveHistory.filter(leave => leave.status === 'pending');
  const approvedLeaves = leaveHistory.filter(leave => leave.status === 'approved');
  
  function getStatusBadge(status) {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Apply Leave</h1>
        <Button>
          Apply New Leave
          <PlusCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Leave</CardTitle>
              <CardDescription>Fill in the details to apply for leave</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select defaultValue="annual">
                      <SelectTrigger id="leaveType">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual Leave</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1">Half Day</Button>
                      <Button variant="outline" size="sm" className="flex-1">Full Day</Button>
                      <Button variant="outline" size="sm" className="flex-1">Multiple Days</Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromDate">From Date</Label>
                    <Input type="date" id="fromDate" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="toDate">To Date</Label>
                    <Input type="date" id="toDate" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <textarea id="reason" placeholder="Please provide a reason for your leave request" className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit Request</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Leave History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="pending" className="flex gap-2">
                    <Clock className="h-4 w-4" />
                    Pending
                    <Badge variant="secondary">{pendingLeaves.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Approved
                    <Badge variant="secondary">{approvedLeaves.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending" className="space-y-4">
                  {pendingLeaves.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No pending leave requests</p>
                  ) : (
                    pendingLeaves.map((leave) => (
                      <LeaveCard key={leave.id} leave={leave} />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="approved" className="space-y-4">
                  {approvedLeaves.map((leave) => (
                    <LeaveCard key={leave.id} leave={leave} />
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Leave Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                className="rounded-md border"
              />
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Leave Balance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Annual Leave:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      15 days left
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Sick Leave:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      10 days left
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Used this year:</span>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      7 days
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LeaveCard({ leave }) {
  function getStatusBadge(status) {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Pending</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  }
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{leave.type}</h3>
            <p className="text-sm text-gray-500">
              {new Date(leave.from).toLocaleDateString()} - {new Date(leave.to).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {leave.days} {leave.days > 1 ? 'days' : 'day'}
            </p>
          </div>
          {getStatusBadge(leave.status)}
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Reason:</span> {leave.reason}
          </p>
        </div>
        
        {leave.status === 'pending' && (
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
              <XCircle className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 