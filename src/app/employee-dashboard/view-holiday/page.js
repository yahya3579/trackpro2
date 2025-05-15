"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Search, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ViewHolidayPage() {
  const [date, setDate] = useState(new Date());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  useEffect(() => {
    fetchHolidays(selectedYear);
  }, [selectedYear]);

  const fetchHolidays = async (year) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`/api/holiday-management?year=${year}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch holidays");
      }

      const data = await response.json();
      setHolidays(data.holidays || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setError(error.message);
      toast.error(error.message || "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  };
  
  // Get upcoming holidays
  const today = new Date();
  const upcomingHolidays = holidays
    .filter(holiday => new Date(holiday.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">View Holidays</h1>
        <div className="flex gap-2">
          <Select 
            value={selectedYear} 
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Holiday Calendar</CardTitle>
              <CardDescription>
                View all holidays for {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <p className="text-red-500">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => fetchHolidays(selectedYear)}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Public Holiday</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Company Holiday</span>
                    </div>
                  </div>
                  
                  {holidays.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No holidays found for {selectedYear}</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holiday Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {holidays.map((holiday) => {
                            const holidayDate = new Date(holiday.date);
                            const dayName = holidayDate.toLocaleDateString('en-US', { weekday: 'long' });
                            
                            return (
                              <tr key={holiday.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {holiday.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {holidayDate.toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {dayName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      holiday.type === "public" 
                                        ? "bg-blue-50 text-blue-700" 
                                        : "bg-green-50 text-green-700"
                                    }
                                  >
                                    {holiday.type === "public" ? "Public Holiday" : "Company Holiday"}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Holidays</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingHolidays.length === 0 ? (
                    <p className="text-center text-gray-500 py-2">No upcoming holidays</p>
                  ) : (
                    upcomingHolidays.map((holiday) => {
                      const holidayDate = new Date(holiday.date);
                      const isUpcoming = holidayDate > today && 
                        holidayDate < new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <div 
                          key={holiday.id} 
                          className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                        >
                          <div className={`rounded-full p-2 ${
                            holiday.type === "public" ? "bg-blue-100" : "bg-green-100"
                          }`}>
                            <CalendarIcon className={`h-4 w-4 ${
                              holiday.type === "public" ? "text-blue-600" : "text-green-600"
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{holiday.title}</p>
                            <p className="text-xs text-gray-500">
                              {holidayDate.toLocaleDateString()} 
                              {isUpcoming && (
                                <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700">
                                  Soon
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 