"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Users, 
  Clock, 
  ChevronRight, 
  Calendar, 
  BarChart2, 
  ClipboardCheck,
  Info,
  CheckCircle2,
  XCircle,
  Clock4
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    productivityScore: 0
  });
  const [productivityData, setProductivityData] = useState([
    { name: 'Productive', value: 0 },
    { name: 'Neutral', value: 0 },
    { name: 'Unproductive', value: 0 }
  ]);
  const [categoryData, setCategoryData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);

  const COLORS = ['#10b981', '#6b7280', '#ef4444'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees data
        const employeesRes = await fetch('/api/employees', {
          headers: { 'x-auth-token': 'token' }
        });
        
        // Fetch pending leaves
        const leavesRes = await fetch('/api/leave-management', {
          headers: { 'x-auth-token': 'token' }
        });
        
        // Fetch productivity summary from the correct endpoint
        const productivityRes = await fetch('/api/activity-monitoring/productivity-summary', {
          headers: { 'x-auth-token': 'token' }
        });
        
        // Fetch productivity breakdown by app category
        const categoriesRes = await fetch('/api/activity-monitoring/categories', {
          headers: { 'x-auth-token': 'token' }
        });
        
        // Fetch employee productivity data for breakdown
        const employeeProductivityRes = await fetch('/api/activity-monitoring/employee-productivity', {
          headers: { 'x-auth-token': 'token' }
        });
        
        // Process employees data
        if (employeesRes.ok) {
          const employeesData = await employeesRes.json();
          console.log('Employees data:', employeesData);
          
          if (employeesData.success && employeesData.employees) {
            const activeEmps = employeesData.employees.filter(emp => emp.status === 'active').length;
            
            setStats(prev => ({
              ...prev,
              totalEmployees: employeesData.employees.length,
              activeEmployees: activeEmps
            }));
          }
        }
        
        // Process leaves data from API
        if (leavesRes.ok) {
          const leavesData = await leavesRes.json();
          console.log('Leaves data:', leavesData);
          
          // Check all possible response structures
          const allLeaveRequests = leavesData.leaveRequests || 
                              leavesData.leaves || 
                              leavesData.data?.leaves || 
                              leavesData.data?.leaveRequests || 
                              [];
          
          // Filter for pending leave requests that need approval/rejection
          const pendingRequests = allLeaveRequests.filter(leave => 
            leave.status === 'pending' || 
            leave.status === 'awaiting_approval' || 
            leave.status === 'waiting_approval'
          );
          
          console.log('Pending leave requests:', pendingRequests);
          
          // Update the stats with pending leaves count
          setStats(prev => ({
            ...prev,
            pendingLeaves: pendingRequests.length
          }));
          
          // Set pending leave requests for approval/rejection tracking
          setLeaveRequests(pendingRequests);
          
          // Show any two pending leave requests on the dashboard
          setRecentLeaves(pendingRequests.slice(0, 2));
          
          if (pendingRequests.length === 0) {
            console.log('No pending leave requests found in response');
            
            // Try fetching directly from the main endpoint as fallback
            try {
              const pendingLeavesRes = await fetch('/api/leave-management/pending', {
                headers: { 'x-auth-token': 'token' }
              });
              
              if (pendingLeavesRes.ok) {
                const pendingData = await pendingLeavesRes.json();
                console.log('Pending leaves endpoint:', pendingData);
                
                const fallbackPendingLeaves = pendingData.leaves || 
                                 pendingData.leaveRequests || 
                                 pendingData.data?.leaves || 
                                 pendingData.data?.leaveRequests || 
                                 [];
                
                if (fallbackPendingLeaves.length > 0) {
                  // Update stats with pending leaves count
                  setStats(prev => ({
                    ...prev,
                    pendingLeaves: fallbackPendingLeaves.length
                  }));
                  
                  // Store pending leaves for approval/rejection
                  setLeaveRequests(fallbackPendingLeaves);
                  
                  // Show any two pending leave requests on the dashboard
                  setRecentLeaves(fallbackPendingLeaves.slice(0, 2));
                }
              }
            } catch (pendingError) {
              console.error("Error fetching pending leave data:", pendingError);
            }
          }
        }
        
        // Process productivity summary
        if (productivityRes.ok) {
          const productivityData = await productivityRes.json();
          console.log('Productivity data:', productivityData);
          
          if (productivityData.success) {
            // Use overallRate from productivity-summary endpoint
            setStats(prev => ({
              ...prev,
              productivityScore: productivityData.overallRate || 0
            }));
          }
        }
        
        // Process employee productivity data for pie chart
        if (employeeProductivityRes.ok) {
          const empProductivityData = await employeeProductivityRes.json();
          console.log('Employee productivity data:', empProductivityData);
          
          if (empProductivityData.success && empProductivityData.employees && empProductivityData.employees.length > 0) {
            // Calculate productive, neutral, and unproductive time across all employees
            let totalSeconds = 0;
            let productiveSeconds = 0;
            let nonProductiveSeconds = 0;
            
            empProductivityData.employees.forEach(emp => {
              productiveSeconds += emp.productive_seconds || 0;
              nonProductiveSeconds += emp.non_productive_seconds || 0;
              totalSeconds += emp.total_seconds || 0;
            });
            
            // Calculate percentages
            const productivePercentage = totalSeconds > 0 ? Math.round((productiveSeconds / totalSeconds) * 100) : 0;
            const nonProductivePercentage = totalSeconds > 0 ? Math.round((nonProductiveSeconds / totalSeconds) * 100) : 0;
            const neutralPercentage = 100 - productivePercentage - nonProductivePercentage;
            
            setProductivityData([
              { name: 'Productive', value: productivePercentage },
              { name: 'Neutral', value: neutralPercentage },
              { name: 'Unproductive', value: nonProductivePercentage }
            ]);
          } else {
            // Fallback data if API fails
            setProductivityData([
              { name: 'Productive', value: 65 },
              { name: 'Neutral', value: 25 },
              { name: 'Unproductive', value: 10 }
            ]);
          }
        }
        
        // Process activity categories data
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          console.log('Categories data:', categoriesData);
          
          if (categoriesData.success && categoriesData.categories) {
            setCategoryData(categoriesData.categories);
          }
        }
        
        // If no leave requests were found at all, reset to empty arrays
        if (recentLeaves.length === 0) {
          setRecentLeaves([]);
          setLeaveRequests([]);
          
          // Reset pending leaves count in stats
          setStats(prev => ({
            ...prev,
            pendingLeaves: 0
          }));
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        
        // Set empty arrays instead of sample data
        setStats({
          totalEmployees: 0,
          activeEmployees: 0,
          pendingLeaves: 0,
          productivityScore: 0
        });
        
        setProductivityData([
          { name: 'Productive', value: 0 },
          { name: 'Neutral', value: 0 },
          { name: 'Unproductive', value: 0 }
        ]);
        
        setLeaveRequests([]);
        setRecentLeaves([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Info className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No data available</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Data will appear here once employees start using the system.
      </p>
    </div>
  );

  const handleLeaveAction = async (leaveId, action) => {
    // Implement leave approval/rejection logic here
    console.log(`Leave ${leaveId} ${action}`);
    
    try {
      const response = await fetch(`/api/leave-management/${leaveId}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': 'token'
        }
      });
      
      if (response.ok) {
        // Refresh the leave requests data
        const updatedLeaveRequests = leaveRequests.filter(request => request.id !== leaveId);
        setLeaveRequests(updatedLeaveRequests);
        setRecentLeaves(updatedLeaveRequests.slice(0, 2));
        
        // Update the pending leaves count
        setStats(prev => ({
          ...prev,
          pendingLeaves: updatedLeaveRequests.length
        }));
        
        alert(`Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      } else {
        alert('Failed to process leave request. Please try again.');
      }
    } catch (error) {
      console.error(`Error ${action}ing leave request:`, error);
      alert('An error occurred while processing the leave request.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Overview Dashboard</h1>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <span>{stats.activeEmployees} active</span>
              <span className="text-muted-foreground">•</span>
              <span>{stats.totalEmployees - stats.activeEmployees} inactive</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{stats.productivityScore}%</div>
            )}
            <Progress value={stats.productivityScore} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Productivity Overview Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Productivity Overview</CardTitle>
            <CardDescription>
              System-wide productivity metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex gap-4 h-[200px]">
                <Skeleton className="h-full w-1/2" />
                <div className="w-1/2 flex flex-col gap-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-1/2 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productivityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {productivityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 flex flex-col justify-center gap-2">
                    {productivityData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="text-sm">{entry.name}: </span>
                        <span className="text-sm font-medium">{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {categoryData.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-2">Top Activity Categories</h4>
                    <div className="space-y-2">
                      {categoryData.slice(0, 3).map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{category.name}</span>
                          <div className="flex items-center">
                            <Progress value={category.percentage} className="h-2 w-24 mr-2" />
                            <span className="text-xs">{Math.round(category.percentage)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leaves Card */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
            <CardDescription>
              Leave requests awaiting approval or rejection
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : recentLeaves.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="space-y-4">
                {recentLeaves.map((request) => (
                  <div key={request.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{request.employee_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.leave_type} • {request.duration || request.days} {request.duration === 1 || request.days === 1 ? 'day' : 'days'}
                        <span className="ml-1">
                          • {request.status === 'approved' ? 'Approved' : 
                             request.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(request.created_at || request.request_date || request.date || request.start_date).toLocaleDateString()}
                        {request.start_date && request.end_date && (
                          <span> to {new Date(request.end_date).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                    {(request.status === 'pending' || 
                      request.status === 'awaiting_approval' || 
                      request.status === 'waiting_approval') && (
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8 text-green-600"
                          onClick={() => handleLeaveAction(request.id, 'approve')}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-8 w-8 text-red-600"
                          onClick={() => handleLeaveAction(request.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button variant="ghost" size="sm" className="gap-1 h-8" onClick={() => window.location.href = "/super-admin-dashboard/leave-requests"}>
              <span>View all pending requests</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 