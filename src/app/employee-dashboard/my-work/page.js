"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock employees data
const mockEmployees = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: null,
    stats: {
      totalWorkedHours: "08h 45m",
      activeTime: "07h 30m",
      productiveAppsPercentage: "85%",
      idleTimePercentage: "15%",
      clockInTime: "9:00 AM",
      clockOutTime: "5:45 PM"
    }
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: null,
    stats: {
      totalWorkedHours: "07h 15m",
      activeTime: "06h 20m",
      productiveAppsPercentage: "78%",
      idleTimePercentage: "22%",
      clockInTime: "9:30 AM",
      clockOutTime: "4:45 PM"
    }
  },
  {
    id: 3,
    name: "Yahya",
    email: "mahafatimacust@gmail.com",
    avatar: null,
    stats: {
      totalWorkedHours: "00h 00m",
      activeTime: "00h 00m",
      productiveAppsPercentage: "0%",
      idleTimePercentage: "0%",
      clockInTime: "-",
      clockOutTime: "-"
    }
  },
  {
    id: 4,
    name: "Alex Johnson",
    email: "alex.j@example.com",
    avatar: null,
    stats: {
      totalWorkedHours: "06h 30m",
      activeTime: "05h 45m",
      productiveAppsPercentage: "72%",
      idleTimePercentage: "28%",
      clockInTime: "10:00 AM",
      clockOutTime: "4:30 PM"
    }
  }
];

export default function MyWorkPage() {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate getting logged in user from localStorage
  useEffect(() => {
    // In a real app, we would fetch from localStorage or an API
    // For demo, we'll use the Yahya user data (ID 3) by default
    const simulateGetLoggedInUser = () => {
      try {
        // Simulate slight delay like a real API call
        setTimeout(() => {
          // Find user with ID 3 (Yahya)
          const loggedInUser = mockEmployees.find(emp => emp.id === 3);
          
          if (loggedInUser) {
            // In a real app, this might come from localStorage
            // localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
            setEmployeeData(loggedInUser);
          } else {
            // Fallback to first user if not found
            setEmployeeData(mockEmployees[0]);
          }
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error loading user data:", error);
        setEmployeeData(mockEmployees[0]);
        setLoading(false);
      }
    };

    simulateGetLoggedInUser();
  }, []);

  // Function to switch between users (for demo purposes)
  const handleUserChange = (userId) => {
    const selectedUser = mockEmployees.find(emp => emp.id === parseInt(userId));
    if (selectedUser) {
      setEmployeeData(selectedUser);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading employee data...</p>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-red-500">Error loading employee data. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Demo Controls - would be removed in production */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500 mb-2">Demo: Switch between employees</p>
        <Select onValueChange={handleUserChange} defaultValue={employeeData.id.toString()}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {mockEmployees.map(emp => (
              <SelectItem key={emp.id} value={emp.id.toString()}>
                {emp.name} (ID: {emp.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Profile Section */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16 text-2xl">
          <AvatarFallback className="bg-orange-300">{employeeData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="text-2xl font-bold">{employeeData.name}</h1>
          <p className="text-green-600">{employeeData.email}</p>
          <p className="text-gray-500 text-sm">Emp ID: {employeeData.id}</p>
        </div>
      </div>

      {/* Statistics Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Worked Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{employeeData.stats.totalWorkedHours}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Active Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{employeeData.stats.activeTime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Productive Apps %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{employeeData.stats.productiveAppsPercentage}</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards - Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Idle Time Spent %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{employeeData.stats.idleTimePercentage}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Clock-in Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{employeeData.stats.clockInTime}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Clock-Out Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{employeeData.stats.clockOutTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Activities Section */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {employeeData.id === 3 ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <p className="text-gray-500">No data found</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Most Used Applications</h3>
                <div className="space-y-2">
                  {employeeData.id === 1 && (
                    <>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Visual Studio Code</span>
                        </div>
                        <span className="text-sm font-medium">3h 15m</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>Google Chrome</span>
                        </div>
                        <span className="text-sm font-medium">2h 30m</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Slack</span>
                        </div>
                        <span className="text-sm font-medium">1h 20m</span>
                      </div>
                    </>
                  )}
                  
                  {employeeData.id === 2 && (
                    <>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Microsoft Excel</span>
                        </div>
                        <span className="text-sm font-medium">2h 45m</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Microsoft Teams</span>
                        </div>
                        <span className="text-sm font-medium">1h 50m</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>Adobe Acrobat</span>
                        </div>
                        <span className="text-sm font-medium">1h 05m</span>
                      </div>
                    </>
                  )}
                  
                  {employeeData.id === 4 && (
                    <>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                          <span>Figma</span>
                        </div>
                        <span className="text-sm font-medium">2h 10m</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Adobe Photoshop</span>
                        </div>
                        <span className="text-sm font-medium">1h 45m</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span>Google Chrome</span>
                        </div>
                        <span className="text-sm font-medium">1h 20m</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Today's Timeline</h3>
                <div className="border-l-2 border-gray-200 pl-4 space-y-4 ml-2">
                  {employeeData.id === 1 && (
                    <>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">9:00 AM - Clock In</p>
                        <p className="text-xs text-gray-500">Started workday</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">9:15 AM - 12:30 PM</p>
                        <p className="text-xs text-gray-500">Development work (VS Code)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">12:30 PM - 1:15 PM</p>
                        <p className="text-xs text-gray-500">Lunch break</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">1:15 PM - 2:45 PM</p>
                        <p className="text-xs text-gray-500">Team meeting (Slack)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">2:45 PM - 5:30 PM</p>
                        <p className="text-xs text-gray-500">Development work (VS Code)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">5:45 PM - Clock Out</p>
                        <p className="text-xs text-gray-500">Ended workday</p>
                      </div>
                    </>
                  )}
                  
                  {employeeData.id === 2 && (
                    <>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">9:30 AM - Clock In</p>
                        <p className="text-xs text-gray-500">Started workday</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">9:45 AM - 11:30 AM</p>
                        <p className="text-xs text-gray-500">Financial analysis (Excel)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">11:30 AM - 12:15 PM</p>
                        <p className="text-xs text-gray-500">Department meeting (Teams)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">12:15 PM - 1:00 PM</p>
                        <p className="text-xs text-gray-500">Lunch break</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">1:00 PM - 3:15 PM</p>
                        <p className="text-xs text-gray-500">Report preparation (Excel)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">4:45 PM - Clock Out</p>
                        <p className="text-xs text-gray-500">Ended workday</p>
                      </div>
                    </>
                  )}

                  {employeeData.id === 4 && (
                    <>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">10:00 AM - Clock In</p>
                        <p className="text-xs text-gray-500">Started workday</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-pink-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">10:15 AM - 12:30 PM</p>
                        <p className="text-xs text-gray-500">UI design work (Figma)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-amber-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">12:30 PM - 1:15 PM</p>
                        <p className="text-xs text-gray-500">Lunch break</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">1:15 PM - 3:00 PM</p>
                        <p className="text-xs text-gray-500">Asset editing (Photoshop)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">3:00 PM - 4:00 PM</p>
                        <p className="text-xs text-gray-500">Research (Chrome)</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                        <p className="text-sm font-medium">4:30 PM - Clock Out</p>
                        <p className="text-xs text-gray-500">Ended workday</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
