"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTemplate } from "../components/page-template";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, XCircle, Chrome, Code, FileText, MessageSquare, Briefcase, Film, Layers } from "lucide-react";

// Utility functions and constants (copied from activity-monitoring)
const formatTime = (seconds) => {
  if (!seconds) return "0h 0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};
const getCategoryIcon = (category) => {
  switch (category) {
    case "browser": return <Chrome size={16} />;
    case "development": return <Code size={16} />;
    case "office": return <FileText size={16} />;
    case "communication": return <MessageSquare size={16} />;
    case "design": return <Layers size={16} />;
    case "entertainment": return <Film size={16} />;
    default: return <Briefcase size={16} />;
  }
};
const CATEGORY_COLORS = {
  browser: "#3b82f6",
  development: "#10b981",
  office: "#f59e0b",
  communication: "#8b5cf6",
  design: "#ec4899",
  entertainment: "#ef4444",
  other: "#6b7280",
};

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

const TIME_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

// export const metadata = {
//   title: "Timeline | TrackPro",
//   description: "View chronological employee activity timeline",
// };

export default function TimelinePage() {
  const [categorySummaryData, setCategorySummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchCategorySummary();
  }, [selectedEmployee, timeRange]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch("/api/employees", {
        headers: { "x-auth-token": token },
      });
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      setEmployees([]);
    }
  };

  const fetchCategorySummary = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      // Calculate date range
      let startDate, endDate;
      const today = new Date();
      switch (timeRange) {
        case "today":
          startDate = today.toISOString().split('T')[0];
          endDate = startDate;
          break;
        case "week": {
          const firstDay = new Date(today);
          const day = today.getDay();
          firstDay.setDate(today.getDate() - day);
          startDate = firstDay.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        }
        case "month": {
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = firstDayOfMonth.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        }
        case "all":
        default:
          startDate = "2023-01-01";
          endDate = "2026-01-01";
      }
      let queryUrl = `/api/activity-monitoring?start_date=${startDate}&end_date=${endDate}`;
      if (selectedEmployee !== "all") {
        queryUrl += `&employee_id=${selectedEmployee}`;
      }
      const response = await fetch(queryUrl, {
        headers: { "x-auth-token": token },
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      // Prepare category summary data (copied from activity-monitoring)
      const categoryMap = {};
      (data.appSummary || []).forEach(app => {
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
      const summary = Object.values(categoryMap)
        .sort((a, b) => b.value - a.value)
        .map(category => ({ ...category, formattedTime: formatTime(category.value) }));
      setCategorySummaryData(summary);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  return (
    <PageTemplate
      title="Timeline"
      description="View a chronological timeline of employee activities and events."
      iconName="History"
    >
      <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id.toString()}>
                {employee.employee_name || `${employee.first_name || ""} ${employee.last_name || ""}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="max-w-2xl mx-auto w-full mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Time spent in different application categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Loading...
              </div>
            ) : categorySummaryData.length === 0 ? (
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
                          background: APP_COLORS[index % APP_COLORS.length]
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
      </div>
    </PageTemplate>
  );
} 