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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  BarChart2, 
  AlertCircle,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { DateRangePicker } from "@/components/date-range-picker";

export default function TimeTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  const [summaryStats, setSummaryStats] = useState({
    totalHours: 0,
    activeHours: 0,
    breakHours: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0
  });

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees', {
          headers: {
            'x-auth-token': 'token'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        if (data.success && data.employees) {
          setEmployees(
            data.employees.map(emp => ({
              id: emp.id,
              name: emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch time tracking data from API
  useEffect(() => {
    const fetchTimeTracking = async () => {
      try {
        setLoading(true);
        
        const startDate = dateRange.from ? dateRange.from.toISOString().split('T')[0] : '';
        const endDate = dateRange.to ? dateRange.to.toISOString().split('T')[0] : '';
        
        const url = new URL('/api/time-tracking', window.location.origin);
        if (startDate) url.searchParams.append('start_date', startDate);
        if (endDate) url.searchParams.append('end_date', endDate);
        if (employeeFilter && employeeFilter !== "all_employees") {
          url.searchParams.append('employee_id', employeeFilter);
        }
        
        const response = await fetch(url, {
          headers: {
            'x-auth-token': 'token'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch time tracking data');
        
        const data = await response.json();
        if (data.success && data.timeData) {
          setTimeEntries(data.timeData);
          calculateSummaryStats(data.timeData);
        } else {
          setTimeEntries([]);
          resetSummaryStats();
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching time tracking data:", error);
        setTimeEntries([]);
        resetSummaryStats();
        setLoading(false);
      }
    };
    
    fetchTimeTracking();
  }, [dateRange, employeeFilter]);

  // Filter time entries based on search term and status filter
  useEffect(() => {
    filterEntries();
  }, [timeEntries, searchTerm, statusFilter]);

  const filterEntries = () => {
    const filtered = timeEntries.filter((entry) => {
      const matchesSearch = entry.employee_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || statusFilter === "all_statuses" ? true : entry.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredEntries(filtered);
  };

  const resetSummaryStats = () => {
    setSummaryStats({
      totalHours: 0,
      activeHours: 0,
      breakHours: 0,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0
    });
  };

  const calculateSummaryStats = (entries) => {
    let totalHours = 0;
    let activeHours = 0;
    let breakHours = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;

    entries.forEach(entry => {
      totalHours += Number(entry.total_hours) || 0;
      activeHours += Number(entry.active_time) || 0;
      breakHours += Number(entry.break_time) || 0;
      
      if (entry.status === 'present') presentCount++;
      else if (entry.status === 'absent') absentCount++;
      else if (entry.status === 'late') lateCount++;
    });

    setSummaryStats({
      totalHours: parseFloat(totalHours.toFixed(2)),
      activeHours: parseFloat(activeHours.toFixed(2)),
      breakHours: parseFloat(breakHours.toFixed(2)),
      presentCount,
      absentCount,
      lateCount
    });
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

  const formatHours = (hours) => {
    if (hours === null || hours === undefined) return "—";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "—";
    try {
      // Handle different time formats
      let time;
      if (timeString.includes("T")) {
        // ISO format
        time = new Date(timeString);
      } else if (timeString.includes(":")) {
        // HH:MM:SS format
        const [hours, minutes] = timeString.split(":");
        time = new Date();
        time.setHours(hours, minutes);
      } else {
        return timeString;
      }
      
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'absent':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'late':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Time Tracking</h1>
        <Button variant="outline">Export Data</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatHours(summaryStats.totalHours)}</div>
            <p className="text-xs text-muted-foreground">
              Active: {formatHours(summaryStats.activeHours)} | Break: {formatHours(summaryStats.breakHours)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold">{summaryStats.presentCount}</div>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{summaryStats.absentCount}</div>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div>
                <div className="text-2xl font-bold">{summaryStats.lateCount}</div>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-md font-medium">
              {dateRange.from ? formatDate(dateRange.from) : 'Start'} - {dateRange.to ? formatDate(dateRange.to) : 'End'}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredEntries.length} entries
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>
            View and manage employee time entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full md:w-auto"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_employees">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No time entries found</h3>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Active Time</TableHead>
                    <TableHead>Break Time</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(entry.employee_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.employee_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{formatTime(entry.clock_in)}</TableCell>
                      <TableCell>{formatTime(entry.clock_out)}</TableCell>
                      <TableCell>{formatHours(entry.total_hours)}</TableCell>
                      <TableCell>{formatHours(entry.active_time)}</TableCell>
                      <TableCell>{formatHours(entry.break_time)}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={getStatusBadgeClass(entry.status)}
                        >
                          {entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : 'Unknown'}
                        </Badge>
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