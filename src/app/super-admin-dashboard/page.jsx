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
        
        // Fetch all leave requests from the main endpoint
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
        
        // Process all leave requests
        if (leavesRes.ok) {
          try {
            const leavesData = await leavesRes.json();
            console.log('Leave requests data:', leavesData);
            
            if (leavesData.success && Array.isArray(leavesData.leaveRequests)) {
              const allLeaves = leavesData.leaveRequests;
              const pendingLeaves = allLeaves.filter(leave => 
                leave.status === 'pending' || 
                leave.status === 'approved' || 
                leave.status === 'rejected'
              );
              
              console.log('Received leaves data, total count:', allLeaves.length);
              console.log('Pending leaves count:', pendingLeaves.length);
              
              // Update the leave requests count in stats
              setStats(prev => ({
                ...prev,
                pendingLeaves: allLeaves.length
              }));
              
              // Store pending leave requests for approval/rejection
              setLeaveRequests(pendingLeaves);
              
              // Just show any 2 pending leave requests on the dashboard
              setRecentLeaves(pendingLeaves.slice(0, 2));
              
              console.log('Set pending leave requests:', pendingLeaves.length);
              console.log('Display on dashboard:', pendingLeaves.slice(0, 2));
            } else {
              // No leave requests found, reset state
              console.log('No leave requests found or API returned incorrect format');
              setLeaveRequests([]);
              setRecentLeaves([]);
              setStats(prev => ({
                ...prev,
                pendingLeaves: 0
              }));
            }
          } catch (parseError) {
            console.error('Error parsing leaves response:', parseError);
            // Reset states on error
            setLeaveRequests([]);
            setRecentLeaves([]);
            setStats(prev => ({
              ...prev,
              pendingLeaves: 0
            }));
          }
        } else {
          console.error('Error fetching leave requests', leavesRes.statusText);
          // Reset leave requests if API call fails
          setLeaveRequests([]);
          setRecentLeaves([]);
          setStats(prev => ({
            ...prev,
            pendingLeaves: 0
          }));
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
        
        // No need to add sample data at this point
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
    try {
      // First check if the action is valid
      if (action !== 'approve' && action !== 'reject') {
        alert('Invalid action. Only approve or reject are allowed.');
        return;
      }
      
      console.log(`Processing leave ${leaveId} - Action: ${action}`);
      
      // Find the approver ID (in a real app, this would come from the logged-in user)
      const approverId = 1; // Using a dummy ID for the super admin
      
      // Prepare the request payload
      const payload = {
        id: leaveId,
        status: action === 'approve' ? 'approved' : 'rejected',
        approver_id: approverId,
        rejection_reason: action === 'reject' ? 'Rejected by admin' : null
      };
      
      // Make the API call to update the leave request
      const response = await fetch('/api/leave-management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': 'token'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Leave request processed:', result);
        
        if (result.success) {
          // Remove the processed leave request from state
          const updatedLeaveRequests = leaveRequests.filter(req => req.id !== leaveId);
          setLeaveRequests(updatedLeaveRequests);
          setRecentLeaves(updatedLeaveRequests.slice(0, 2));
          
          // Update the pending leaves count
          setStats(prev => ({
            ...prev,
            pendingLeaves: updatedLeaveRequests.length
          }));
          
          alert(`Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
        } else {
          alert(`Error: ${result.error || 'Failed to process leave request'}`);
        }
      } else {
        alert(`API Error: ${response.statusText}`);
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
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{productivityData[0]?.value || 0}%</div>
            )}
            <Progress value={productivityData[0]?.value || 0} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Productivity Overview Card */}
        <Card className="md:col-span-3 bg-gradient-to-br from-white/90 to-blue-50/60 border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Productivity Overview</CardTitle>
            <CardDescription className="text-base text-muted-foreground">System-wide productivity metrics</CardDescription>
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
                  <div className="w-1/2 h-[220px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productivityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={false}
                          labelLine={false}
                          isAnimationActive={true}
                        >
                          {productivityData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              style={{ filter: 'drop-shadow(0 2px 8px rgba(59,130,246,0.10))', cursor: 'pointer', transition: 'filter 0.2s' }}
                              onMouseOver={e => { if (e && e.target) e.target.style.filter = 'brightness(1.15) drop-shadow(0 4px 16px rgba(59,130,246,0.18))'; }}
                              onMouseOut={e => { if (e && e.target) e.target.style.filter = 'drop-shadow(0 2px 8px rgba(59,130,246,0.10))'; }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 flex flex-col justify-center gap-3">
                    {/* Custom Legend */}
                    {productivityData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="block w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                        <span className="text-base font-medium text-gray-700">{entry.name}</span>
                        <span className="text-base font-semibold text-primary">{entry.value}%</span>
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
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>
              View leave requests
            </CardDescription>
          </CardHeader>
          
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