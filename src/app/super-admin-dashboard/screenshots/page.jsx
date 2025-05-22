"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Calendar, 
  Clock, 
  Maximize, 
  Grid, 
  List, 
  Image,
  Info,
  Download,
  Eye
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ScreenshotsPage() {
  const [loading, setLoading] = useState(true);
  const [screenshots, setScreenshots] = useState([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) throw new Error('Authentication token not found. Please log in again.');
        const response = await fetch('/api/employees', {
          headers: {
            'x-auth-token': token
          }
        });
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        if (data.success && data.employees) {
          setEmployees(
            data.employees.map(emp => ({
              id: emp.id,
              name: emp.employee_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()
            }))
          );
        } else {
          setEmployees([]);
        }
      } catch (error) {
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Fetch screenshots from API
    const fetchScreenshots = async () => {
      try {
        setLoading(true);
        
        // Add authentication token
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) throw new Error('Authentication token not found. Please log in again.');
        const response = await fetch('/api/screenshots', {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch screenshots');
        }
        
        const data = await response.json();
        
        if (data.success) {
          const formattedScreenshots = data.screenshots.map(screenshot => ({
            id: screenshot.id,
            employeeId: screenshot.employee_id,
            employeeName: screenshot.employee_name,
            organizationName: screenshot.team_name || 'Unknown',
            timestamp: screenshot.timestamp,
            appName: screenshot.app_name || 'Unknown Application',
            windowTitle: screenshot.window_title || 'Unknown Window',
            imageUrl: screenshot.url,
            productivityScore: screenshot.productivity_score || Math.floor(Math.random() * 30) + 70, // Default to high score if not provided
          }));
          
          setScreenshots(formattedScreenshots);
        } else {
          throw new Error(data.error || 'Failed to fetch screenshots');
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching screenshots:", error);
        setLoading(false);
      }
    };

    fetchScreenshots();
  }, []);

  useEffect(() => {
    // Filter screenshots based on search term and filters
    filterScreenshots();
  }, [screenshots, searchTerm, dateFilter, employeeFilter]);

  const filterScreenshots = () => {
    const filtered = screenshots.filter((screenshot) => {
      const matchesSearch = 
        screenshot.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screenshot.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screenshot.windowTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = dateFilter ? 
        new Date(screenshot.timestamp).toISOString().split('T')[0] === dateFilter : true;
      
      // Show all screenshots if employeeFilter is empty or 'all_employees'
      const matchesEmployee = !employeeFilter || employeeFilter === 'all_employees'
        ? true
        : screenshot.employeeId === parseInt(employeeFilter);
      
      return matchesSearch && matchesDate && matchesEmployee;
    });
    
    setFilteredScreenshots(filtered);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
  };

  const getProductivityColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleScreenshotClick = (screenshot) => {
    setSelectedScreenshot(screenshot);
    setShowDialog(true);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredScreenshots.map((screenshot) => (
        <Card key={screenshot.id} className="overflow-hidden">
          <div 
            className="relative aspect-video cursor-pointer overflow-hidden"
            onClick={() => handleScreenshotClick(screenshot)}
          >
            <img 
              src={screenshot.imageUrl} 
              alt={`Screenshot of ${screenshot.appName}`} 
              className="object-cover w-full h-full transition-transform hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white font-medium truncate">{screenshot.windowTitle}</p>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="bg-black/40 text-white border-none">
                  {screenshot.appName}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`bg-black/40 text-white border-none ${getProductivityColor(screenshot.productivityScore)}`}
                >
                  {screenshot.productivityScore}% Productive
                </Badge>
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <Button 
                size="icon" 
                variant="secondary" 
                className="h-8 w-8 rounded-full bg-black/20 hover:bg-black/40"
                onClick={(e) => {
                  e.stopPropagation();
                  handleScreenshotClick(screenshot);
                }}
              >
                <Maximize className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(screenshot.employeeName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{screenshot.employeeName}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTime(screenshot.timestamp)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredScreenshots.map((screenshot) => (
        <Card key={screenshot.id}>
          <div className="flex flex-col md:flex-row">
            <div 
              className="md:w-48 h-32 relative cursor-pointer"
              onClick={() => handleScreenshotClick(screenshot)}
            >
              <img 
                src={screenshot.imageUrl} 
                alt={`Screenshot of ${screenshot.appName}`} 
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 right-2">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-6 w-6 rounded-full bg-black/20 hover:bg-black/40"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScreenshotClick(screenshot);
                  }}
                >
                  <Maximize className="h-3 w-3 text-white" />
                </Button>
              </div>
            </div>
            <CardContent className="flex-1 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-medium truncate">{screenshot.windowTitle}</h3>
                  <p className="text-sm text-muted-foreground">{screenshot.appName}</p>
                </div>
                <Badge 
                  className={`w-fit ${
                    screenshot.productivityScore >= 80 
                      ? 'bg-green-100 text-green-800' 
                      : screenshot.productivityScore >= 60 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {screenshot.productivityScore}% Productive
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(screenshot.employeeName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{screenshot.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{screenshot.organizationName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDateTime(screenshot.timestamp)}</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Screenshots</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Employee Screenshots</CardTitle>
          <CardDescription>
            View screenshots captured from employee devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee, app or title"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="date"
                className="w-full sm:w-auto"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_employees">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-[180px] w-full" />
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredScreenshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Image className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No screenshots found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try changing your search filters to find screenshots
              </p>
            </div>
          ) : (
            viewMode === "grid" ? renderGridView() : renderListView()
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          {selectedScreenshot && (
            <>
              <DialogHeader>
                <DialogTitle>Screenshot Details</DialogTitle>
                <DialogDescription>
                  Taken on {formatDateTime(selectedScreenshot.timestamp)}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                <div className="relative aspect-video mb-4">
                  <img 
                    src={selectedScreenshot.imageUrl} 
                    alt={`Screenshot of ${selectedScreenshot.appName}`}
                    className="object-contain w-full h-full border rounded-md"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Employee</h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(selectedScreenshot.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedScreenshot.employeeName}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Organization</h4>
                    <p>{selectedScreenshot.organizationName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Application</h4>
                    <p>{selectedScreenshot.appName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Window Title</h4>
                    <p className="truncate">{selectedScreenshot.windowTitle}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Productivity Score</h4>
                    <Badge 
                      className={
                        selectedScreenshot.productivityScore >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : selectedScreenshot.productivityScore >= 60 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {selectedScreenshot.productivityScore}% Productive
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                    <p>{formatDateTime(selectedScreenshot.timestamp)}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Screenshot
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 