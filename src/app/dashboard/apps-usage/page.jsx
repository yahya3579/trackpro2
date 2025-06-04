"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Monitor,
  Calendar as CalendarIcon,
  Clock,
  Chrome,
  Code,
  FileText,
  MessageSquare,
  Briefcase,
  Film,
  Layers,
  Loader2,
  AlertCircle,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartJsTooltip,
  Legend as ChartJsLegend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartJsTooltip, ChartJsLegend);

// Add APP_COLORS array at the top (copy from activity-monitoring)
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

export default function AppUsagePage() {
  const [employees, setEmployees] = useState([]);
  const [appData, setAppData] = useState({
    appUsage: [],
    appSummary: [],
    productivityStats: []
  });
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [timeRange, setTimeRange] = useState("week");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("apps");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAppData();
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

  const fetchAppData = async () => {
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
          startDate = "2023-01-01"; // Captures older data
          endDate = "2026-01-01";   // Captures future data
          break;
        default:
          startDate = "2023-01-01";
          endDate = "2026-01-01";
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
        throw new Error("Failed to fetch application usage data");
      }

      const data = await response.json();
      setAppData({
        appUsage: data.appUsage || [],
        appSummary: data.appSummary || [],
        productivityStats: data.productivityStats || []
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching application data:", error);
      toast.error("Failed to load application usage data");
      setIsLoading(false);
    }
  };

  // Prepare app usage summary data for charts
  const prepareAppSummaryData = () => {
    // Sort by total duration and take top 10
    return appData.appSummary
      .sort((a, b) => b.total_duration - a.total_duration)
      .slice(0, 10)
      .map(app => ({
        name: app.application_name,
        value: app.total_duration / 3600,
        category: app.category,
        productive: app.productive,
        usage_count: app.usage_count,
        formattedTime: formatTime(app.total_duration)
      }));
  };

  const appSummaryData = prepareAppSummaryData();

  // Prepare category summary data
  const prepareCategorySummaryData = () => {
    const categoryMap = {};
    
    appData.appSummary.forEach(app => {
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

  // Calculate total time
  const calculateTotalTime = () => {
    const totalSeconds = appData.appSummary.reduce(
      (sum, app) => sum + parseInt(app.total_duration || 0), 
      0
    );
    
    return formatTime(totalSeconds);
  };

  // Calculate productivity rate
  const calculateProductivityRate = () => {
    const productive = appData.productivityStats.find(stat => stat.productive === 1);
    const total = appData.productivityStats.reduce(
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
          <h1 className="text-3xl font-bold tracking-tight text-black flex items-center gap-2">
            <BarChart2 className="h-7 w-7 text-primary" />
            Application Usage
          </h1>
          <p className="text-muted-foreground">
            Track and analyze application usage across your team
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button variant="outline" onClick={fetchAppData} size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        
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
      </div>

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
              {selectedEmployee === "all" ? "Across all employees" : "For selected employee"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Productivity Rate</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateProductivityRate()}</div>
            <p className="text-xs text-muted-foreground">
              Productive vs non-productive apps
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Applications Used</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appData.appSummary.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique applications tracked
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

      {/* Top Applications Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            Top Applications
          </CardTitle>
          <CardDescription>
            Most used applications by time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex flex-col gap-4">
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
                    style={{ background: APP_COLORS[index % APP_COLORS.length], color: '#fff' }}
                    className="rounded px-2 py-1 text-xs font-medium shadow"
                  >
                    {entry.name}
                  </Badge>
                ))}
              </div>
              <div className="h-[350px] w-full">
                <Bar
                  data={{
                    labels: appSummaryData.map(app => app.name),
                    datasets: [
                      {
                        label: 'Usage Time (hours)',
                        data: appSummaryData.map(app => app.value),
                        backgroundColor: appSummaryData.map((app, index) => APP_COLORS[index % APP_COLORS.length]),
                        borderRadius: 8,
                        maxBarThickness: 32,
                      },
                    ],
                  }}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: '#fff',
                        titleColor: '#222',
                        bodyColor: '#222',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        callbacks: {
                          label: function(context) {
                            const app = appSummaryData[context.dataIndex];
                            return [
                              `Time: ${app.formattedTime} (${app.value.toFixed(1)} hrs)`,
                              `Category: ${app.category}`,
                              `Usage Count: ${app.usage_count}`,
                              `Status: ${app.productive ? 'Productive' : 'Non-productive'}`
                            ];
                          }
                        }
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          color: '#e5e7eb',
                        },
                        title: {
                          display: true,
                          text: 'Time (hours)',
                          color: '#888',
                          font: { size: 13, weight: 'bold' },
                        },
                        ticks: {
                          color: '#888',
                          font: { size: 12 },
                        },
                      },
                      y: {
                        grid: {
                          color: '#f3f4f6',
                        },
                        ticks: {
                          color: '#222',
                          font: { size: 13, weight: 'bold' },
                        },
                      },
                    },
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Application Usage Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-black">Application Details</CardTitle>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode("apps")}>
              <BarChart2 className="h-4 w-4 mr-1" /> 
              Apps
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode("categories")}>
              <PieChartIcon className="h-4 w-4 mr-1" />
              Categories
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appData.appSummary.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No application data</h3>
              <p className="text-muted-foreground">
                No applications tracked in this period
              </p>
            </div>
          ) : viewMode === "apps" ? (
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
                {appData.appSummary.map((app, index) => (
                  <TableRow key={`${app.application_name}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: APP_COLORS[index % APP_COLORS.length] }}
                        />
                        <span className="font-medium">{app.application_name}</span>
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
                        background: APP_COLORS[index % APP_COLORS.length]
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>
                      Productive: {formatTime(category.productive)}
                    </div>
                    <div>
                      Non-productive: {formatTime(category.unproductive)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="text-xs text-muted-foreground">
            {appData.appSummary.length} applications tracked during {timeRange === "today" ? "today" : 
              timeRange === "week" ? "this week" : 
              timeRange === "month" ? "this month" : "all time"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 