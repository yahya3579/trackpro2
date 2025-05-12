"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Search, Filter } from "lucide-react";

export default function ViewHolidayPage() {
  const [date, setDate] = useState(new Date());
  
  // Mock holidays data
  const holidays = [
    { id: 1, name: "New Year's Day", date: "2023-01-01", type: "Public Holiday" },
    { id: 2, name: "Martin Luther King Jr. Day", date: "2023-01-16", type: "Public Holiday" },
    { id: 3, name: "Presidents' Day", date: "2023-02-20", type: "Public Holiday" },
    { id: 4, name: "Memorial Day", date: "2023-05-29", type: "Public Holiday" },
    { id: 5, name: "Independence Day", date: "2023-07-04", type: "Public Holiday" },
    { id: 6, name: "Labor Day", date: "2023-09-04", type: "Public Holiday" },
    { id: 7, name: "Veterans Day", date: "2023-11-11", type: "Public Holiday" },
    { id: 8, name: "Thanksgiving Day", date: "2023-11-23", type: "Public Holiday" },
    { id: 9, name: "Christmas Day", date: "2023-12-25", type: "Public Holiday" },
    { id: 10, name: "Company Outing", date: "2023-06-30", type: "Company Holiday" },
    { id: 11, name: "End of Year Party", date: "2023-12-22", type: "Company Holiday" }
  ];
  
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
          <Select defaultValue="2023">
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
                View all holidays for the selected year
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                              {holiday.name}
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
                                  holiday.type === "Public Holiday" 
                                    ? "bg-blue-50 text-blue-700" 
                                    : "bg-green-50 text-green-700"
                                }
                              >
                                {holiday.type}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
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
                          holiday.type === "Public Holiday" ? "bg-blue-100" : "bg-green-100"
                        }`}>
                          <CalendarIcon className={`h-4 w-4 ${
                            holiday.type === "Public Holiday" ? "text-blue-600" : "text-green-600"
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{holiday.name}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 