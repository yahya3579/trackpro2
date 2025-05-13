"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Clock,
  User,
  Users,
  Activity,
  Calendar as CalendarIcon,
  Search,
  AlarmClock,
  Timer,
  BarChart2,
  PieChart as PieChartIcon,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// export const metadata = {
//   title: "Time Tracking | TrackPro",
//   description: "View chronological employee activity timeline",
// };

export default function TimeTrackingPage() {
  const [employees, setEmployees] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("overview");

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTimeData();
  }, [selectedEmployee, timeRange]);

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
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    }
  };

  const fetchTimeData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Calculate date range based on selected time range
      let startDate, endDate;
      const today = new Date();
      
      switch (timeRange) {
        case "today":
          startDate = today.toISOString().split('T')[0];
          endDate = startDate;
          break;
        case "week":
          // Get the first day of the week (Sunday)
          const firstDay = new Date(today);
          const day = today.getDay();
          firstDay.setDate(today.getDate() - day);
          startDate = firstDay.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case "month":
          // Get the first day of the month
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = firstDayOfMonth.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        default:
          // Default to last 7 days
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          startDate = lastWeek.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
      }

      // Build the query URL
      let queryUrl = `/api/time-tracking?start_date=${startDate}&end_date=${endDate}`;
      
      if (selectedEmployee !== "all") {
        queryUrl += `&employee_id=${selectedEmployee}`;
      }

      const response = await fetch(queryUrl, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch time tracking data");
      }

      const data = await response.json();
      setTimeData(data.timeData || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching time data:", error);
      toast.error("Failed to load time tracking data");
      setIsLoading(false);
    }
  };

  // Filter data based on selected employee and time range
  const getFilteredData = () => {
    return timeData;
  };

  const filteredData = getFilteredData();

  // Calculate summary data
  const calculateSummary = (data) => {
    if (data.length === 0) return {
      totalHours: "0.0",
      totalActiveHours: "0.0",
      totalBreakHours: "0.0",
      activePercentage: "0.0",
      presentDays: 0,
      absentDays: 0,
    };
    
    const totalHours = data.reduce((sum, item) => sum + parseFloat(item.total_hours || 0), 0);
    const totalActiveHours = data.reduce((sum, item) => sum + parseFloat(item.active_time || 0), 0);
    const totalBreakHours = data.reduce((sum, item) => sum + parseFloat(item.break_time || 0), 0);
    const presentDays = data.filter(item => item.status === "present").length;
    const absentDays = data.filter(item => item.status === "absent").length;
    
    return {
      totalHours: totalHours.toFixed(1),
      totalActiveHours: totalActiveHours.toFixed(1),
      totalBreakHours: totalBreakHours.toFixed(1),
      activePercentage: totalHours > 0 ? ((totalActiveHours / totalHours) * 100).toFixed(1) : "0.0",
      presentDays,
      absentDays,
    };
  };

  const summary = calculateSummary(filteredData);

  // Prepare chart data
  const prepareChartData = (data) => {
    // Group by employee name if showing all employees
    if (selectedEmployee === "all") {
      const employeeData = {};
      
      data.forEach(item => {
        if (!employeeData[item.employee_name]) {
          employeeData[item.employee_name] = {
            name: item.employee_name,
            totalHours: 0,
            activeTime: 0,
            breakTime: 0
          };
        }
        
        employeeData[item.employee_name].totalHours += parseFloat(item.total_hours || 0);
        employeeData[item.employee_name].activeTime += parseFloat(item.active_time || 0);
        employeeData[item.employee_name].breakTime += parseFloat(item.break_time || 0);
      });
      
      return Object.values(employeeData);
    } 
    // Group by date for a specific employee
    else {
      const dateData = {};
      
      data.forEach(item => {
        const formattedDate = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (!dateData[formattedDate]) {
          dateData[formattedDate] = {
            name: formattedDate,
            totalHours: 0,
            activeTime: 0,
            breakTime: 0
          };
        }
        
        dateData[formattedDate].totalHours += parseFloat(item.total_hours || 0);
        dateData[formattedDate].activeTime += parseFloat(item.active_time || 0);
        dateData[formattedDate].breakTime += parseFloat(item.break_time || 0);
      });
      
      // Sort by date
      return Object.values(dateData).sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA - dateB;
      });
    }
  };

  const chartData = prepareChartData(filteredData);

  // Pie chart data for time distribution
  const timeDistributionData = [
    { name: "Active Time", value: parseFloat(summary.totalActiveHours) || 0 },
    { name: "Break Time", value: parseFloat(summary.totalBreakHours) || 0 },
  ];

  const COLORS = ["#4f46e5", "#f97316"];

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Monitor employee time and productivity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id.toString()}>
                  {employee.employee_name || `${employee.first_name} ${employee.last_name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalHours}h</div>
                <p className="text-xs text-muted-foreground">
                  Hours worked in the period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Active Time</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalActiveHours}h</div>
                <p className="text-xs text-muted-foreground">
                  {summary.activePercentage}% of total time
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.presentDays}</div>
                <p className="text-xs text-muted-foreground">
                  Days with tracked time
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Break Time</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalBreakHours}h</div>
                <p className="text-xs text-muted-foreground">
                  Total break time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>
                  Total vs. active hours {selectedEmployee === "all" ? "per employee" : "per day"}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalHours" name="Total Hours" fill="#4f46e5" />
                    <Bar dataKey="activeTime" name="Active Time" fill="#06b6d4" />
                    <Bar dataKey="breakTime" name="Break Time" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Time Distribution</CardTitle>
                <CardDescription>
                  Breakdown of active vs. break time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {timeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Time Log Details</CardTitle>
              <CardDescription>
                Detailed time tracking records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No time data available</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filter settings or time range
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Active Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{entry.employee_name}</TableCell>
                        <TableCell>{formatTime(entry.clock_in)}</TableCell>
                        <TableCell>{formatTime(entry.clock_out)}</TableCell>
                        <TableCell>{parseFloat(entry.total_hours).toFixed(1)}h</TableCell>
                        <TableCell>{parseFloat(entry.active_time).toFixed(1)}h</TableCell>
                        <TableCell>
                          <Badge 
                            variant={entry.status === "present" ? "default" : entry.status === "leave" ? "outline" : "destructive"}
                          >
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 