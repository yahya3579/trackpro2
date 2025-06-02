"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Treemap,
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
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Monitor,
  Calendar as CalendarIcon,
  Clock,
  BarChart2,
  PieChart as PieChartIcon,
  List,
  TrendingUp,
  AlertCircle,
  Chrome,
  Code,
  FileText,
  MessageSquare,
  Briefcase,
  Film,
  Layers,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

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
const formatDateTime = (dateTime, date) => {
  if (!dateTime) return "N/A";
  
  // If it's just a time string in format HH:MM:SS or HH:MM
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateTime)) {
    // Return only hours and minutes
    return dateTime.substring(0, 5);
  }
  
  // If time-only (e.g., '08:30:00'), combine with date if provided
  if (/^\d{2}:\d{2}:\d{2}$/.test(dateTime) && date) {
    // date is expected as 'YYYY-MM-DD' or Date object
    let dateStr = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
    dateTime = `${dateStr}T${dateTime}`;
  } else if (typeof dateTime === "string" && dateTime.includes(" ") && !dateTime.endsWith("Z")) {
    // Fix for MySQL DATETIME format: replace space with 'T'
    dateTime = dateTime.replace(" ", "T");
  }
  const dateObj = new Date(dateTime);
  if (isNaN(dateObj.getTime())) return dateTime; // Return original if parsing fails
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

// Application colors for pie chart visualization
const APP_COLORS = [
  "#7F56D9", // Purple
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Orange
  "#EC4899", // Pink
  "#6366F1", // Indigo
  "#14B8A6", // Teal
  "#F97316", // Amber
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#A855F7", // Fuchsia
  "#F43F5E", // Rose
  "#0EA5E9", // Sky
  "#22C55E", // Emerald
  "#EAB308", // Yellow
];

// Consistent color assignment for each app name
const getAppColor = (appName) => {
  if (!appName) return APP_COLORS[0];
  // Simple hash function to map app name to a color index
  let hash = 0;
  for (let i = 0; i < appName.length; i++) {
    hash = appName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % APP_COLORS.length;
  return APP_COLORS[index];
};

export default function ActivityMonitoringPage() {
  const [employees, setEmployees] = useState([]);
  const [activityData, setActivityData] = useState({
    appUsage: [],
    appSummary: [],
    productivityStats: []
  });
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [timeRange, setTimeRange] = useState("week");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("overview");
  const [hoveredApp, setHoveredApp] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
  const progressBarRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchActivityData();
  }, [selectedEmployee, timeRange, selectedCategory]);

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

  const fetchActivityData = async () => {
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
        case "all":
          // Use a wide range to capture all data
          startDate = "2023-01-01"; // Captures your 2023 data
          endDate = "2026-01-01";   // Captures your 2025 data
          break;
        default:
          // Default to a wide date range to capture all sample data
          startDate = "2023-01-01"; // This will include your older sample data
          endDate = "2026-01-01";   // This will include future data and current queries
      }

      // Build the query URL
      let queryUrl = `/api/activity-monitoring?start_date=${startDate}&end_date=${endDate}`;
      
      if (selectedEmployee !== "all") {
        queryUrl += `&employee_id=${selectedEmployee}`;
      }
      
      if (selectedCategory !== "all") {
        queryUrl += `&category=${selectedCategory}`;
      }

      const response = await fetch(queryUrl, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch activity data");
      }

      const data = await response.json();
      // Sanitize appUsage and appSummary data
      const sanitizedAppUsage = (data.appUsage || []).map(app => ({
        ...app,
        total_duration: Number(app.total_duration) || 0,
      }));
      const sanitizedAppSummary = (data.appSummary || []).map(app => ({
        ...app,
        total_duration: Number(app.total_duration) || 0,
      }));
      setActivityData({
        appUsage: sanitizedAppUsage,
        appSummary: sanitizedAppSummary,
        productivityStats: data.productivityStats || [],
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      toast.error("Failed to load activity monitoring data");
      setIsLoading(false);
    }
  };

  // Prepare app usage summary data for charts
  const prepareAppSummaryData = () => {
    const data = activityData.appSummary
      .sort((a, b) => b.total_duration - a.total_duration)
      .slice(0, 10)
      .map(app => ({
        name: app.application_name,
        value: app.total_duration / 3600, // Convert seconds to hours
        category: app.category,
        productive: app.productive,
        usage_count: app.usage_count,
        formattedTime: formatTime(app.total_duration),
        total_duration: Number(app.total_duration) || 0,
      }));
    console.log('Prepared appSummaryData:', data); // Debug log
    return data;
  };

  const appSummaryData = useMemo(() => prepareAppSummaryData(), [activityData.appSummary]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Monitoring</h1>
          <p className="text-muted-foreground">
            Track employee application usage and productivity.
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
                  Time spent on productive applications
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activityData.appSummary.length}</div>
                <p className="text-xs text-muted-foreground">
                  Unique applications used
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                {categorySummaryData.length > 0 && getCategoryIcon(categorySummaryData[0].name)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {categorySummaryData.length > 0 ? categorySummaryData[0].name : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {categorySummaryData.length > 0 ? categorySummaryData[0].formattedTime : ""}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Applications Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Applications</CardTitle>
                <CardDescription>
                  Most used applications by time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex flex-col gap-4">
                {appSummaryData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No application data</h3>
                    <p className="text-muted-foreground">No applications tracked in this period</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {appSummaryData.map((entry, index) => (
                        <Badge
                          key={`${entry.name}-${index}`}
                          style={{ background: getAppColor(entry.name), color: '#fff' }}
                          className="rounded px-2 py-1 text-xs font-medium shadow"
                        >
                          {entry.name}
                        </Badge>
                      ))}
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={appSummaryData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                        barCategoryGap={16}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#888' }}
                          label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#888' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width= {90}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 13, fill: '#222' }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || !payload.length) return null;
                            const app = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-white p-3 shadow-md min-w-[180px]">
                                <div className="font-semibold mb-1">{app.name}</div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="block w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[app.category] || CATEGORY_COLORS.other }} />
                                  <span className="capitalize text-xs">{app.category}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">{app.formattedTime} ({app.value.toFixed(1)} hrs)</div>
                                <div className="text-xs">Usage Count: <span className="font-medium">{app.usage_count}</span></div>
                                <div className="text-xs">Status: <Badge variant={app.productive ? 'default' : 'destructive'}>{app.productive ? 'Productive' : 'Non-productive'}</Badge></div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="value"
                          name="Usage Time"
                          radius={[6, 6, 6, 6]}
                          minPointSize={4}
                        >
                          {appSummaryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getAppColor(entry.name)}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Productivity Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Productivity Distribution</CardTitle>
                <CardDescription>
                  Time spent on productive vs non-productive apps
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={productivityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      label={({ name, percent }) => percent > 0.08 ? `${name}` : ''}
                      labelLine={false}
                      dataKey="value"
                      nameKey="name"
                    >
                      {productivityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.name === 'Productive' ? '#10b981' : entry.name === 'Non-productive' ? '#ef4444' : '#8884d8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [props.payload.formattedTime, name]}
                      labelFormatter={(name) => name}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Time spent in different application categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categorySummaryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No category data</h3>
                  <p className="text-muted-foreground">
                    No application categories tracked in this period
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {categorySummaryData.map((category, index) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category.name)}
                          <span className="font-medium capitalize">{category.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{category.formattedTime}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${(category.value / categorySummaryData[0].value) * 100}%`,
                            background: getAppColor(category.name)
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CheckCircle size={12} className="text-green-500" /> 
                          {formatTime(category.productive)}
                        </div>
                        <div className="flex items-center gap-1">
                          <XCircle size={12} className="text-red-500" /> 
                          {formatTime(category.unproductive)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apps">
          <Card>
            <CardHeader>
              <CardTitle>Application Usage</CardTitle>
              <CardDescription>
                Detailed breakdown of application usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appSummaryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No application data</h3>
                  <p className="text-muted-foreground">
                    No applications tracked in this period
                  </p>
                </div>
              ) : (
                <>
                  {/* Application Usage Progress Bar */}
                  <div className="mb-8 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Usage Distribution</h3>
                      <span className="text-xs text-muted-foreground">{calculateTotalTime()}</span>
                    </div>
                    <div
                      className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex relative"
                      ref={progressBarRef}
                    >
                      {appSummaryData.map((app, index) => {
                        const totalTime = appSummaryData.reduce((sum, app) => sum + parseInt(app.total_duration || 0), 0);
                        const percentage = totalTime > 0 ? (app.total_duration / totalTime) * 100 : 0;
                        return (
                          <div
                            key={`progress-${app.name}-${index}`}
                            className="h-full"
                            style={{
                              width: `${percentage}%`,
                              minWidth: '12px',
                              backgroundColor: getAppColor(app.name),
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {appSummaryData.map((app, index) => (
                        <div key={`legend-${app.name}-${index}`} className="flex items-center gap-1.5">
                          <div 
                            className="w-3 h-3 rounded-sm" 
                            style={{ backgroundColor: getAppColor(app.name) }} 
                          />
                          <span className="text-xs font-medium">{app.name}</span>
                          <span className="text-xs text-muted-foreground">({formatTime(app.total_duration)})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Usage Time</TableHead>
                        <TableHead>Usage Count</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityData.appSummary.map((app, index) => (
                        <TableRow key={`${app.application_name}-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-sm flex-shrink-0" 
                                style={{ backgroundColor: getAppColor(app.application_name) }} 
                              />
                              <div className="font-medium">{app.application_name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(app.category)}
                              <span className="capitalize">{app.category}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatTime(app.total_duration)}</TableCell>
                          <TableCell>{app.usage_count}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={app.productive ? "default" : "destructive"}
                            >
                              {app.productive ? "Productive" : "Non-productive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Chronological log of application activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityData.appUsage.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No activity data</h3>
                  <p className="text-muted-foreground">
                    No activities logged in this period
                  </p>
                </div>
              ) : (
                <>
                  {/* Activity Visualization Section */}
                  <div className="grid gap-6 md:grid-cols-2 mb-8 w-full overflow-x-auto">
                    {/* Left: App List */}
                    <div className="flex flex-col space-y-4 min-w-[320px]">
                      <h3 className="text-lg font-semibold">Application Usage</h3>
                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-4">
                        {activityData.appUsage
                          .reduce((unique, app) => {
                            const existing = unique.find(item => item.application_name === app.application_name);
                            if (!existing) {
                              unique.push(app);
                            }
                            return unique;
                          }, [])
                          .map((app, index) => (
                            <div 
                              key={`app-${app.application_name}`}
                              className="flex items-center p-2 rounded-lg"
                              style={{ backgroundColor: `${getAppColor(app.application_name)}15` }}
                            >
                              <div 
                                className="w-5 h-5 rounded-md mr-3 flex-shrink-0" 
                                style={{ backgroundColor: getAppColor(app.application_name) }}
                              />
                              <div className="flex-1 font-medium">{app.application_name}</div>
                              {app.productive && (
                                <Badge 
                                  variant="outline"
                                  className="ml-auto text-green-600 bg-green-50"
                                >
                                  productive
                                </Badge>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                    {/* Right: Pie Chart */}
                    <div className="flex items-center justify-center min-w-[340px] h-[320px]">
                      <ResponsiveContainer width="100%" height={320}>
                        {appSummaryData.length > 0 ? (
                          <PieChart>
                            <Pie
                              data={appSummaryData}
                              dataKey="total_duration"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              label={({ name, percent }) => percent > 0.08 ? `${name}` : ''}
                              labelLine={false}
                            >
                              {appSummaryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getAppColor(entry.name)} />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload || !payload.length) return null;
                                const app = payload[0].payload;
                                return (
                                  <div className="rounded-lg border bg-white p-3 shadow-md min-w-[180px]">
                                    <div className="font-semibold mb-1">{app.name}</div>
                                    <div className="text-xs text-muted-foreground">Time: {formatTime(app.total_duration)}</div>
                                  </div>
                                );
                              }}
                            />
                          </PieChart>
                        ) : (
                          <div className="flex flex-col items-center justify-center mb-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mb-2" />
                            <span>No app usage data to display for the selected filters.</span>
                          </div>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Browser Tab/URL Usage Pie Chart (No Labels) */}
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold mb-4 text-center">Browser Tab/URL Usage</h3>
                    <ResponsiveContainer width="100%" height={320}>
                      {(() => {
                        // Aggregate all url_details from browser apps only
                        const urlMap = {};
                        activityData.appUsage.forEach(app => {
                          if (app.category === 'browser' && Array.isArray(app.url_details)) {
                            app.url_details.forEach(urlObj => {
                              const urlKey = urlObj.url || urlObj.window_titles?.[0] || 'Unknown';
                              if (!urlMap[urlKey]) {
                                urlMap[urlKey] = {
                                  url: urlObj.url || urlKey,
                                  window_titles: urlObj.window_titles || [],
                                  total_duration: 0,
                                  usage_count: 0,
                                };
                              }
                              urlMap[urlKey].total_duration += Number(urlObj.total_duration) || 0;
                              urlMap[urlKey].usage_count += Number(urlObj.usage_count) || 0;
                            });
                          }
                        });
                        const urlData = Object.values(urlMap).sort((a, b) => b.total_duration - a.total_duration);
                        if (urlData.length === 0) {
                          return (
                            <div className="flex items-center justify-center mb-8 text-muted-foreground">
                              No browser tab/url data to display.
                            </div>
                          );
                        }
                        return (
                          <PieChart>
                            <Pie
                              data={urlData}
                              dataKey="total_duration"
                              nameKey="url"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={2}
                              label={() => ''}
                              labelLine={false}
                            >
                              {urlData.map((entry, index) => (
                                <Cell key={`cell-url-${index}`} fill={APP_COLORS[index % APP_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload || !payload.length) return null;
                                const urlObj = payload[0].payload;
                                return (
                                  <div className="rounded-lg border bg-white p-3 shadow-md min-w-[220px] max-w-[350px]">
                                    <div className="font-semibold mb-1 truncate" title={urlObj.url}>{urlObj.url}</div>
                                    {urlObj.window_titles && urlObj.window_titles.length > 0 && (
                                      <div className="text-xs text-muted-foreground mb-1 truncate" title={urlObj.window_titles[0]}>Tab: {urlObj.window_titles[0]}</div>
                                    )}
                                    <div className="text-xs">Time: <span className="font-medium">{formatTime(urlObj.total_duration)}</span></div>
                                    <div className="text-xs">Switch Count: <span className="font-medium">{urlObj.usage_count}</span></div>
                                  </div>
                                );
                              }}
                            />
                          </PieChart>
                        );
                      })()}
                    </ResponsiveContainer>
                  </div>

                  {/* Activity Log Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Application</TableHead>
                        <TableHead>Window Title / URL</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Employee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityData.appUsage.map((activity) => (
                        <TableRow key={`${activity.employee_id}_${activity.application_name}_${activity.date}`}>
                          <TableCell>
                            {new Date(activity.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(activity.time || activity.first_time, activity.date)}
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
                          <TableCell>
                            {formatTime(activity.total_duration)}
                          </TableCell>
                          <TableCell>
                            {activity.employee_name}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}