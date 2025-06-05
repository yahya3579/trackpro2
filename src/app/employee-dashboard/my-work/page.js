"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Activity, BarChart2, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartTitle, ChartTooltip, ChartLegend);

export default function MyWork() {
  // State for date range selection
  const [date, setDate] = useState({
    from: new Date(),
    to: new Date(),
  });
  
  // States for data
  const [timeTrackingData, setTimeTrackingData] = useState(null);
  const [appUsageData, setAppUsageData] = useState([]);
  const [productivityData, setProductivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appUsageTab, setAppUsageTab] = useState("all");

  // Get token from localStorage
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  // Format date for API calls
  const formatDateForAPI = (date) => {
    return format(date, "yyyy-MM-dd");
  };

  // Fetch time tracking data
  const fetchTimeTrackingData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const startDate = formatDateForAPI(date.from);
      const endDate = formatDateForAPI(date.to);

      const res = await fetch(`/api/time-tracking?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      const data = await res.json();
      if (data.success) {
        setTimeTrackingData(data.timeData);
      }
    } catch (error) {
      console.error("Error fetching time tracking data:", error);
    }
  };

  // Fetch app usage data
  const fetchAppUsageData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const startDate = formatDateForAPI(date.from);
      const endDate = formatDateForAPI(date.to);

      const res = await fetch(
        `/api/activity-monitoring?start_date=${startDate}&end_date=${endDate}&employee_view=true`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setAppUsageData(data.appUsage || []);
      }
    } catch (error) {
      console.error("Error fetching app usage data:", error);
    }
  };

  // Fetch productivity data
  const fetchProductivityData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const startDate = formatDateForAPI(date.from);
      const endDate = formatDateForAPI(date.to);

      const res = await fetch(
        `/api/activity-monitoring/employee-productivity?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      const data = await res.json();
      if (data.success && data.employees && data.employees.length > 0) {
        setProductivityData(data.employees[0]);
      }
    } catch (error) {
      console.error("Error fetching productivity data:", error);
    }
  };

  // Format seconds to hours and minutes
  const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Fetch all data when date range changes
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTimeTrackingData(),
        fetchAppUsageData(),
        fetchProductivityData(),
      ]);
      setLoading(false);
    };

    if (date.from && date.to) {
      fetchAllData();
    }
  }, [date]);

  // Group app usage by application name, and collect first_time and last_end_time
  const appUsageSummary = appUsageData.reduce((acc, item) => {
    const key = item.application_name;
    if (!acc[key]) {
      acc[key] = {
        name: key,
        duration: 0,
        productive: Number(item.productive),
        category: item.category || "other",
        first_time: item.first_time,
        last_end_time: item.last_end_time,
      };
    } else {
      if (item.first_time && (!acc[key].first_time || item.first_time < acc[key].first_time)) {
        acc[key].first_time = item.first_time;
      }
      if (item.last_end_time && (!acc[key].last_end_time || item.last_end_time > acc[key].last_end_time)) {
        acc[key].last_end_time = item.last_end_time;
      }
    }
    acc[key].duration += item.duration_seconds || 0;
    return acc;
  }, {});

  // Convert to array and sort by duration
  const sortedAppUsage = Object.values(appUsageSummary).sort(
    (a, b) => b.duration - a.duration
  );

  // Filtered app usage based on selected tab
  let filteredAppUsage = sortedAppUsage;
  if (appUsageTab === "productive") {
    filteredAppUsage = sortedAppUsage.filter((app) => app.productive === 1);
  } else if (appUsageTab === "nonProductive") {
    filteredAppUsage = sortedAppUsage.filter((app) => app.productive === 0);
  }
  filteredAppUsage = filteredAppUsage.sort((a, b) => b.duration - a.duration);

  // Prepare data for stacked bar chart: one dataset for productive, one for non-productive
  const appNames = Array.from(new Set(appUsageData.map(item => item.application_name)));
  const productiveData = appNames.map(appName => {
    return appUsageData
      .filter(item => item.application_name === appName && item.productive === 1)
      .reduce((sum, item) => sum + (item.duration_seconds || 0), 0) / 60;
  });
  const nonProductiveData = appNames.map(appName => {
    return appUsageData
      .filter(item => item.application_name === appName && item.productive === 0)
      .reduce((sum, item) => sum + (item.duration_seconds || 0), 0) / 60;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            My Work
          </h1>
          <p className="text-gray-500">
            Track your work hours and productivity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className="w-auto lg:w-[300px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading your work data...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Productivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productivityData ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Productivity Rate
                      </span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {productivityData.productivity_rate || 0}%
                      </span>
                    </div>
                    <Progress value={productivityData.productivity_rate || 0} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Productive Time
                      </span>
                      <span className="text-lg font-medium flex items-center gap-1">
                        <Clock className="h-5 w-5 text-primary" />
                        {formatTime(productivityData.productive_seconds)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Non-Productive Time
                      </span>
                      <span className="text-lg font-medium flex items-center gap-1">
                        <Clock className="h-5 w-5 text-destructive" />
                        {formatTime(productivityData.non_productive_seconds)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                        Total Time
                      </span>
                      <span className="text-lg font-medium flex items-center gap-1">
                        <Clock className="h-5 w-5 text-blue-500" />
                        {formatTime(productivityData.total_seconds)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No productivity data available for the selected date range.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                App Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appNames.length > 0 ? (
                <div className="w-full max-w-2xl mx-auto" style={{ height: 340 }}>
                  <Bar
                    data={{
                      labels: appNames,
                      datasets: [
                        {
                          label: 'Productive (minutes)',
                          data: productiveData,
                          backgroundColor: '#10B981',
                          stack: 'Stack 0',
                        },
                        {
                          label: 'Non-Productive (minutes)',
                          data: nonProductiveData,
                          backgroundColor: '#EF4444',
                          stack: 'Stack 0',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                            font: { size: 14 },
                          },
                        },
                        title: {
                          display: true,
                          text: 'App Usage (Minutes)',
                          font: { size: 18 },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed.y || 0;
                              const seconds = Math.round(value * 60);
                              return `${context.dataset.label}: ${formatTime(seconds)}`;
                            }
                          }
                        },
                      },
                      scales: {
                        x: {
                          stacked: true,
                          grid: {
                            color: '#e5e7eb',
                          },
                          title: {
                            display: true,
                            text: 'Application',
                            color: '#888',
                            font: { size: 13, weight: 'bold' },
                          },
                          ticks: {
                            color: '#888',
                            font: { size: 12 },
                          },
                        },
                        y: {
                          stacked: true,
                          grid: {
                            color: '#f3f4f6',
                          },
                          title: {
                            display: true,
                            text: 'Time (minutes)',
                            color: '#888',
                            font: { size: 13, weight: 'bold' },
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
              ) : (
                <div className="text-center text-gray-500">
                  No valid app usage data available for the selected date range.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}