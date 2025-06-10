"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Activity, Timer, Calendar as CalendarIcon, Loader2, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function MyWork() {
  const [timeData, setTimeData] = useState([]);
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);

  // Fetch data on mount and when time range changes
  useEffect(() => {
    fetchTimeData();
  }, [timeRange]);

  // Function to get token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  // Fetch time tracking data from API
  const fetchTimeData = async () => {
    setLoading(true);
    try {
      const token = getToken();
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

      // Build the query URL - will automatically filter for current employee
      const queryUrl = `/api/time-tracking?start_date=${startDate}&end_date=${endDate}`;

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
    } catch (error) {
      console.error("Error fetching time data:", error);
      toast.error("Failed to load time tracking data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to flatten nested timeData object to array
  const flattenTimeData = (data) => {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    // data is an object: {date: {employee_id: {...}}}
    return Object.values(data).flatMap(dateObj => Object.values(dateObj));
  };

  // Parse sessions data which could be a string or array
  function parseSessions(sessions) {
    if (Array.isArray(sessions)) {
      return sessions;
    }
    
    if (typeof sessions === 'string') {
      try {
        // Some databases might return escaped JSON strings
        const cleanedString = sessions.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        return JSON.parse(cleanedString);
      } catch (e) {
        // Try another approach if the first one fails
        try {
          // Check if it might be wrapped in additional quotes
          if (sessions.startsWith('"') && sessions.endsWith('"')) {
            const innerJson = sessions.substring(1, sessions.length - 1);
            return JSON.parse(innerJson);
          }
          
          // Handle cases where it's a string representation of array but not properly quoted
          if (sessions.includes("{") && sessions.includes("}")) {
            const fixedJson = sessions
              .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
              .replace(/'/g, '"');
            return JSON.parse(fixedJson);
          }
        } catch (innerError) {
          console.error("Failed to parse sessions:", innerError);
        }
      }
    }
    
    return [];
  }

  // Helper to get clock in/out from sessions
  function getClockInOutFromSessions(sessions) {
    const parsedSessions = parseSessions(sessions);
    if (!Array.isArray(parsedSessions) || parsedSessions.length === 0) {
      return { clockIn: null, clockOut: null };
    }
    
    // Sort sessions by start time
    const sortedSessions = parsedSessions.slice().sort((a, b) => {
      if (!a.start || !b.start) return 0;
      return a.start > b.start ? 1 : -1;
    });
    
    const first = sortedSessions[0];
    const last = sortedSessions[sortedSessions.length - 1];
    
    return {
      clockIn: first.start || null,
      clockOut: last.end || null
    };
  }

  // Format time (HH:MM:SS to HH:MM)
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Calculate summary data
  const calculateSummary = (data) => {
    const flatData = flattenTimeData(data);
    if (flatData.length === 0) return {
      totalHours: "0.0",
      totalActiveHours: "0.0",
      totalBreakHours: "0.0",
      activePercentage: "0.0",
      presentDays: 0,
      absentDays: 0,
    };
    
    const totalHours = flatData.reduce((sum, item) => sum + parseFloat(item.total_hours || 0), 0);
    const totalActiveHours = flatData.reduce((sum, item) => sum + parseFloat(item.active_time || 0), 0);
    const totalBreakHours = flatData.reduce((sum, item) => sum + parseFloat(item.break_time || 0), 0);
    const presentDays = flatData.filter(item => item.status === "present").length;
    const absentDays = flatData.filter(item => item.status === "absent").length;
    
    return {
      totalHours: totalHours.toFixed(1),
      totalActiveHours: totalActiveHours.toFixed(1),
      totalBreakHours: totalBreakHours.toFixed(1),
      activePercentage: totalHours > 0 ? ((totalActiveHours / totalHours) * 100).toFixed(1) : "0.0",
      presentDays,
      absentDays,
    };
  };

  const summary = calculateSummary(timeData);
  const flatData = flattenTimeData(timeData);

  if (loading) {
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
          <h1 className="text-3xl font-bold tracking-tight text-black flex items-center gap-2">
            <Clock className="h-7 w-7 text-primary" />
            My Work History
          </h1>
          <p className="text-muted-foreground">
            View your time tracking records
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
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Total Hours
            </CardTitle>
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
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Active Time
            </CardTitle>
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
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-500" />
              Present Days
            </CardTitle>
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
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-500" />
              Break Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalBreakHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total break time
            </p>
          </CardContent>
        </Card>
        {/* Last Clock In/Out Cards */}
        {(() => {
          const latestRecord = flatData
            .filter(entry => 
              parseFloat(entry.total_hours) > 0 || 
              (entry.clock_in && entry.clock_out) ||
              (entry.sessions && parseSessions(entry.sessions).length > 0)
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          
          if (!latestRecord) {
            return [
              <Card key="no-clock-in" className="col-span-2 flex justify-center items-center py-6 bg-white rounded-lg">
                <p className="text-muted-foreground">No recent time records available</p>
              </Card>,
              <Card key="no-clock-out" className="col-span-2 flex justify-center items-center py-6 bg-white rounded-lg" />
            ];
          }

          const sessions = parseSessions(latestRecord.sessions);
          let clockIn = latestRecord.clock_in;
          let clockOut = latestRecord.clock_out;
          
          if (sessions && sessions.length > 0) {
            const { clockIn: sessClockIn, clockOut: sessClockOut } = getClockInOutFromSessions(sessions);
            clockIn = sessClockIn || clockIn;
            clockOut = sessClockOut || clockOut;
          }
          
          const date = latestRecord.date && !isNaN(new Date(latestRecord.date))
            ? new Date(latestRecord.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : "N/A";
          
          return [
            <Card key="clock-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-green-500" />
                  Clock In
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(clockIn)}</div>
                <p className="text-xs text-muted-foreground">
                  {date}
                </p>
              </CardContent>
            </Card>,
            <Card key="clock-out">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-red-500" />
                  Clock Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(clockOut)}</div>
                <p className="text-xs text-muted-foreground">
                  {date}
                </p>
              </CardContent>
            </Card>
          ];
        })()}
      </div>
    </div>
  );
}