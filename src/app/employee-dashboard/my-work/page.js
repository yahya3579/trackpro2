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
import { Calendar as CalendarIcon, Clock, Activity } from "lucide-react";

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

  // Group app usage by application name
  const appUsageSummary = appUsageData.reduce((acc, item) => {
    const key = item.application_name;
    if (!acc[key]) {
      acc[key] = {
        name: key,
        duration: 0,
        productive: item.productive,
        category: item.category || "other",
      };
    }
    acc[key].duration += item.duration_seconds || 0;
    return acc;
  }, {});

  // Convert to array and sort by duration
  const sortedAppUsage = Object.values(appUsageSummary).sort(
    (a, b) => b.duration - a.duration
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Work</h1>
          <p className="text-gray-500">
            Track your work hours and productivity
          </p>
        </div>

        {/* Date Range Picker */}
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
          {/* Time Tracking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {timeTrackingData && timeTrackingData[0] ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">Clock In</span>
                      <span className="text-lg font-medium">
                        {timeTrackingData[0].clock_in
                          ? typeof timeTrackingData[0].clock_in === 'string' && !timeTrackingData[0].clock_in.includes('T')
                            ? timeTrackingData[0].clock_in.substring(0, 5) // Extract HH:MM from time string
                            : new Date(timeTrackingData[0].clock_in).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">Clock Out</span>
                      <span className="text-lg font-medium">
                        {timeTrackingData[0].clock_out
                          ? typeof timeTrackingData[0].clock_out === 'string' && !timeTrackingData[0].clock_out.includes('T')
                            ? timeTrackingData[0].clock_out.substring(0, 5) // Extract HH:MM from time string
                            : new Date(timeTrackingData[0].clock_out).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">Total Hours</span>
                      <span className="text-lg font-medium">
                        {timeTrackingData[0].total_hours || 0} hours
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="col-span-3 text-center text-gray-500">
                    No time tracking data available for the selected date range.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Productivity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Productivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productivityData ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Productivity Rate
                      </span>
                      <span className="text-sm font-medium">
                        {productivityData.productivity_rate || 0}%
                      </span>
                    </div>
                    <Progress value={productivityData.productivity_rate || 0} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">
                        Productive Time
                      </span>
                      <span className="text-lg font-medium">
                        {formatTime(productivityData.productive_seconds)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">
                        Non-Productive Time
                      </span>
                      <span className="text-lg font-medium">
                        {formatTime(productivityData.non_productive_seconds)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">Total Time</span>
                      <span className="text-lg font-medium">
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

          {/* App Usage */}
          <Card>
            <CardHeader>
              <CardTitle>App Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedAppUsage && sortedAppUsage.length > 0 ? (
                <div className="space-y-6">
                  <Tabs defaultValue="all">
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="productive">Productive</TabsTrigger>
                      <TabsTrigger value="nonProductive">
                        Non-Productive
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        {sortedAppUsage.map((app, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center border-b pb-2"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  app.productive === 1
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              <span className="font-medium">{app.name}</span>
                              <span className="text-xs text-gray-500">
                                {app.category}
                              </span>
                            </div>
                            <span>{formatTime(app.duration)}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="productive" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        {sortedAppUsage
                          .filter((app) => app.productive === 1)
                          .map((app, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center border-b pb-2"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="font-medium">{app.name}</span>
                                <span className="text-xs text-gray-500">
                                  {app.category}
                                </span>
                              </div>
                              <span>{formatTime(app.duration)}</span>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="nonProductive" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        {sortedAppUsage
                          .filter((app) => app.productive === 0)
                          .map((app, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center border-b pb-2"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="font-medium">{app.name}</span>
                                <span className="text-xs text-gray-500">
                                  {app.category}
                                </span>
                              </div>
                              <span>{formatTime(app.duration)}</span>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No app usage data available for the selected date range.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 