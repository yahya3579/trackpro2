"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, PauseCircle, Clock, CalendarIcon, ArrowUpRight } from "lucide-react";

export default function TimesheetPage() {
  const [date, setDate] = useState(new Date());
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Mock timesheet entries
  const timesheetEntries = [
    { id: 1, date: '2023-06-14', startTime: '09:00 AM', endTime: '05:30 PM', duration: '8h 30m', project: 'Website Development' },
    { id: 2, date: '2023-06-13', startTime: '09:15 AM', endTime: '06:00 PM', duration: '8h 45m', project: 'Mobile App' },
    { id: 3, date: '2023-06-12', startTime: '08:45 AM', endTime: '05:15 PM', duration: '8h 30m', project: 'Website Development' },
    { id: 4, date: '2023-06-09', startTime: '09:30 AM', endTime: '06:30 PM', duration: '9h 00m', project: 'API Integration' },
    { id: 5, date: '2023-06-08', startTime: '09:00 AM', endTime: '05:00 PM', duration: '8h 00m', project: 'Website Development' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Timesheet</h1>
        <Button>
          Export Data
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Time Tracker</CardTitle>
              <Clock className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-4xl font-bold mb-6">
                  {isTimerRunning ? "00:45:30" : "00:00:00"}
                </p>
                
                <div className="flex justify-center gap-4">
                  {isTimerRunning ? (
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => setIsTimerRunning(false)}
                      className="flex items-center gap-2"
                    >
                      <PauseCircle className="h-5 w-5" />
                      Pause
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={() => setIsTimerRunning(true)}
                      className="flex items-center gap-2"
                    >
                      <PlayCircle className="h-5 w-5" />
                      Start Working
                    </Button>
                  )}
                  
                  {isTimerRunning && (
                    <Button variant="destructive" size="lg">Stop & Save</Button>
                  )}
                </div>
                
                {isTimerRunning && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Working on: Website Development</p>
                    <p className="text-sm text-gray-500">Started at: 09:15 AM</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {timesheetEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.startTime} - {entry.endTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                            {entry.project}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Work summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>This week:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      32h 45m
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>This month:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      128h 20m
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 