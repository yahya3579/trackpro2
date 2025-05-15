"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
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
import {
  Activity,
  Monitor,
  Calendar as CalendarIcon,
  Clock,
  BarChart2,
  PieChart as PieChartIcon,
  List,
  TrendingUp,
  Chrome,
  Code,
  FileText,
  MessageSquare,
  Briefcase,
  Film,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Function to format seconds into readable time
const formatTime = (seconds) => {
  if (!seconds) return "0h 0m";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  
  return `${hours}h ${minutes}m`;
};

// Function to format date and time
const formatDateTime = (dateTime) => {
  if (!dateTime) return "N/A";
  return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Function to get category icon
const getCategoryIcon = (category) => {
  switch (category) {
    case "browser":
      return <Chrome size={16} />;
    case "development":
      return <Code size={16} />;
    case "office":
      return <FileText size={16} />;
    case "communication":
      return <MessageSquare size={16} />;
    case "design":
      return <Layers size={16} />;
    case "entertainment":
      return <Film size={16} />;
    default:
      return <Briefcase size={16} />;
  }
};

// Colors for categories
const CATEGORY_COLORS = {
  browser: "#3b82f6",
  development: "#10b981",
  office: "#f59e0b",
  communication: "#8b5cf6",
  design: "#ec4899",
  entertainment: "#ef4444",
  other: "#6b7280",
};

// Colors for productivity
const PRODUCTIVITY_COLORS = ["#ef4444", "#10b981"];

export default function MyWorkPage() {
  const [activityData, setActivityData] = useState({
    appUsage: [],
    appSummary: [],
    productivityStats: []
  });
  const [timeRange, setTimeRange] = useState("week");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("overview");

  useEffect(() => {
    fetchActivityData();
  }, [timeRange, selectedCategory]);

  const fetchActivityData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
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
        case "all":
          // Use a wide range to capture all data
          startDate = "2023-01-01";
          endDate = "2026-01-01";
          break;
        default:
          startDate = "2023-01-01";
          endDate = "2026-01-01";
      }

      // Build the query URL - no need to include employee_id as the API will filter by the token
      let queryUrl = `/api/activity-monitoring?start_date=${startDate}&end_date=${endDate}&employee_view=true`;
      
      if (selectedCategory !== "all") {
        queryUrl += `&category=${selectedCategory}`;
      }

      const response = await fetch(queryUrl, {
        headers: {
          "x-auth-token": token,
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity data");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch activity data");
      }
      
      setActivityData({
        appUsage: data.appUsage || [],
        appSummary: data.appSummary || [],
        productivityStats: data.productivityStats || []
      });
    } catch (err) {
      console.error("Error fetching activity data:", err);
      setError(err.message || "Failed to fetch activity data");
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare app usage summary data for charts
  const prepareAppSummaryData = () => {
    // Sort by total duration and take top 10
    return activityData.appSummary
      .sort((a, b) => b.total_duration - a.total_duration)
      .slice(0, 10)
      .map(app => ({
        name: app.application_name,
        value: app.total_duration,
        category: app.category,
        productive: app.productive,
        formattedTime: formatTime(app.total_duration)
      }));
  };

  const appSummaryData = prepareAppSummaryData();

  // Prepare category summary data
  const prepareCategorySummaryData = () => {
    const categoryMap = {};
    
    activityData.appSummary.forEach(app => {
      if (!categoryMap[app.category]) {
        categoryMap[app.category] = {
          name: app.category,
          value: 0,
          productive: 0,
          unproductive: 0
        };
      }
      
      categoryMap[app.category].value += parseInt(app.total_duration);
      
      if (app.productive) {
        categoryMap[app.category].productive += parseInt(app.total_duration);
      } else {
        categoryMap[app.category].unproductive += parseInt(app.total_duration);
      }
    });
    
    return Object.values(categoryMap)
      .sort((a, b) => b.value - a.value)
      .map(category => ({
        ...category,
        formattedTime: formatTime(category.value)
      }));
  };

  const categorySummaryData = prepareCategorySummaryData();

  // Prepare productivity summary data
  const prepareProductivityData = () => {
    // If there's no data, return placeholder data
    if (!activityData.productivityStats.length) {
      return [
        { name: "Productive", value: 0 },
        { name: "Non-productive", value: 0 }
      ];
    }
    
    const productive = activityData.productivityStats.find(stat => stat.productive === 1);
    const unproductive = activityData.productivityStats.find(stat => stat.productive === 0);
    
    return [
      { 
        name: "Productive", 
        value: productive ? parseInt(productive.total_duration) : 0,
        formattedTime: formatTime(productive ? productive.total_duration : 0) 
      },
      { 
        name: "Non-productive", 
        value: unproductive ? parseInt(unproductive.total_duration) : 0,
        formattedTime: formatTime(unproductive ? unproductive.total_duration : 0)
      }
    ];
  };

  const productivityData = prepareProductivityData();

  // Calculate total time
  const calculateTotalTime = () => {
    const totalSeconds = activityData.appSummary.reduce(
      (sum, app) => sum + parseInt(app.total_duration || 0), 
      0
    );
    
    return formatTime(totalSeconds);
  };

  // Calculate productivity rate
  const calculateProductivityRate = () => {
    const productive = activityData.productivityStats.find(stat => stat.productive === 1);
    const total = activityData.productivityStats.reduce(
      (sum, stat) => sum + parseInt(stat.total_duration || 0), 
      0
    );
    
    if (!total) return "0%";
    
    const productiveTime = productive ? parseInt(productive.total_duration) : 0;
    return `${Math.round((productiveTime / total) * 100)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Work Activity</h1>
          <p className="text-muted-foreground">
            Track your application usage and productivity.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="browser">Browser</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
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

      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="apps" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Time Tracked</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateTotalTime()}</div>
                <p className="text-xs text-muted-foreground">
                  Total application usage time
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Productivity Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateProductivityRate()}</div>
                <p className="text-xs text-muted-foreground">
                  Ratio of productive time to total time
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Top Application</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">
                  {appSummaryData.length > 0 ? appSummaryData[0].name : "None"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {appSummaryData.length > 0 ? appSummaryData[0].formattedTime : "No data"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {categorySummaryData.length > 0 ? categorySummaryData[0].name : "None"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {categorySummaryData.length > 0 ? categorySummaryData[0].formattedTime : "No data"}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Productivity Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity Breakdown</CardTitle>
              <CardDescription>
                Distribution of productive vs non-productive time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productivityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {productivityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PRODUCTIVITY_COLORS[index % PRODUCTIVITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name, props) => [props.payload.formattedTime, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="apps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications Usage</CardTitle>
              <CardDescription>
                Time spent in different applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appSummaryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(value) => formatTime(value)}
                    />
                    <RechartsTooltip
                      formatter={(value, name, props) => [props.payload.formattedTime, "Usage Time"]}
                    />
                    <Bar
                      dataKey="value"
                      name="Usage Time"
                      radius={[6, 6, 6, 6]}
                      maxBarSize={40}
                    >
                      {appSummaryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Applications List</CardTitle>
              <CardDescription>
                Detailed list of applications used
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Productivity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appSummaryData.map((app, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[app.category] || CATEGORY_COLORS.other }}
                          />
                          <span className="capitalize">{app.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>{app.formattedTime}</TableCell>
                      <TableCell>
                        <Badge variant={app.productive ? "default" : "destructive"}>
                          {app.productive ? "Productive" : "Non-productive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Detailed log of application usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.appUsage.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No activity data found for this time period.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead>Window Title / URL</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityData.appUsage.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          {new Date(activity.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(activity.start_time)} - {formatDateTime(activity.end_time)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(activity.category)}
                            <span className="font-medium">
                              {activity.application_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={activity.window_title}>
                          {activity.window_title}
                          {activity.category === 'browser' && activity.url && (
                            <div className="text-xs text-blue-600 underline mt-1 truncate" title={activity.url}>
                              <a href={activity.url} target="_blank" rel="noopener noreferrer">{activity.url}</a>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatTime(activity.duration_seconds)}</TableCell>
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