"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowUpRight, 
  Users, 
  Clock, 
  BarChart2, 
  Activity, 
  ChevronRight, 
  LineChart, 
  Calendar, 
  Settings, 
  Mail, 
  User,
  Loader2,
  PieChart as PieChartIcon,
  TrendingUp,
  Info,
  Award,
  Sparkles,
  History
} from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { PulseButton } from "@/components/ui/aceternity-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// export const metadata = {
//   title: "Dashboard | TrackPro",
//   description: "Employee Monitoring Dashboard",
// };

export default function DashboardPage() {
  const [employees, setEmployees] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [productivityData, setProductivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productivityCategories, setProductivityCategories] = useState([]);
  const [hoveredPieIndex, setHoveredPieIndex] = useState(null);

  // Helper function to safely get token
  const getAuthToken = () => {
    try {
      return localStorage.getItem("token") || "";
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return "";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        
        if (!token) {
          console.error("No authentication token found");
          setLoading(false);
          return;
        }

        // Fetch all employees data
        const employeesResponse = await fetch('/api/employees?limit=1000', {
          headers: {
            "x-auth-token": token
          }
        });

        if (!employeesResponse.ok) {
          console.error('Error fetching employees:', employeesResponse.status, employeesResponse.statusText);
          setEmployees([]);
          throw new Error(`Failed to fetch employees: ${employeesResponse.status}`);
        }

        const responseText = await employeesResponse.text();
        let employeesData;
        
        try {
          employeesData = JSON.parse(responseText);
          const allEmployees = employeesData.employees || [];
          setEmployees(allEmployees);
          
          // Calculate active employees directly from the employees data
          const activeEmpCount = allEmployees.filter(
            emp => emp.status === "active" || emp.status === "activated"
          ).length;
          
          setActiveEmployees(activeEmpCount);
          
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError, responseText.substring(0, 100));
          setEmployees([]);
          setActiveEmployees(0);
        }
        
        // Fetch active employees data from the activity endpoint as a fallback
        try {
          const activeResponse = await fetch('/api/activity-monitoring/active-users', {
            headers: {
              "x-auth-token": token
            }
          });
          
          if (activeResponse.ok) {
            const activeData = await activeResponse.json();
            // Only use this data if we couldn't get active count from employees data
            if (!employeesData || !employeesData.employees) {
              setActiveEmployees(activeData.activeCount || 0);
            }
          }
        } catch (error) {
          console.error('Error fetching active users from activity monitoring:', error);
          // If we already have active employees count from employees data, no need to set to 0
        }
        
        // Fetch productivity data
        const productivityResponse = await fetch('/api/activity-monitoring/productivity-summary', {
          headers: {
            "x-auth-token": token
          }
        });
        
        let employeeProductivityData = null;
        
        // Fetch individual employee productivity data
        try {
          const empProdResponse = await fetch('/api/activity-monitoring/employee-productivity', {
            headers: {
              "x-auth-token": token
            }
          });
          
          if (empProdResponse.ok) {
            const empProdData = await empProdResponse.json();
            employeeProductivityData = empProdData.employees || [];
          }
        } catch (error) {
          console.error('Error fetching employee productivity:', error);
        }
        
        if (!productivityResponse.ok) {
          console.error('Error fetching productivity:', productivityResponse.status);
          setProductivityData({
            averageProductivity: 0,
            productiveHours: 0,
            totalTrackedHours: 0,
            change: 0,
            employeeProductivity: []
          });
        } else {
          try {
            const productivityData = await productivityResponse.json();
            
            // Normalize the productivity rate to ensure it's between 0-100%
            const normalizedRate = productivityData.overallRate 
              ? Math.min(Math.max(0, parseFloat(productivityData.overallRate)), 100) 
              : 0;
            
            // Directly use the data from the productivity-summary API
            setProductivityData({
              averageProductivity: normalizedRate,
              productiveHours: productivityData.productiveHours || 0,
              totalTrackedHours: productivityData.totalHours || 0,
              change: productivityData.weeklyChange || 0,
              employeeProductivity: employeeProductivityData || []
            });
          } catch (error) {
            console.error('Error parsing productivity data:', error);
            setProductivityData({
              averageProductivity: 0,
              productiveHours: 0,
              totalTrackedHours: 0,
              change: 0,
              employeeProductivity: []
            });
          }
        }
        
        // Fetch productivity categories data
        const categoriesResponse = await fetch('/api/activity-monitoring/categories', {
          headers: {
            "x-auth-token": token
          }
        });
        
        if (!categoriesResponse.ok) {
          console.error('Error fetching categories:', categoriesResponse.status);
          setProductivityCategories([
            { name: "Development", value: 40, color: "text-blue-500" },
            { name: "Meetings", value: 25, color: "text-purple-500" },
            { name: "Communication", value: 20, color: "text-green-500" },
            { name: "Other", value: 15, color: "text-gray-500" }
          ]);
        } else {
          try {
            const categoriesData = await categoriesResponse.json();
            
            // Map the colors to the categories
            const colorMap = {
              "Development": "text-blue-500",
              "Meetings": "text-purple-500",
              "Communication": "text-green-500",
              "Research": "text-amber-500",
              "Documentation": "text-red-500",
              "Design": "text-indigo-500",
              "Testing": "text-teal-500",
              "Planning": "text-pink-500",
              "Other": "text-gray-500"
            };
            
            // Transform API data to the format we need
            const formattedCategories = categoriesData.categories.map(category => ({
              name: category.name,
              value: category.percentage,
              color: colorMap[category.name] || "text-gray-500" // Default color if not found
            }));
            
            setProductivityCategories(formattedCategories);
          } catch (error) {
            console.error('Error parsing categories data:', error);
            setProductivityCategories([
              { name: "Development", value: 40, color: "text-blue-500" },
              { name: "Meetings", value: 25, color: "text-purple-500" },
              { name: "Communication", value: 20, color: "text-green-500" },
              { name: "Other", value: 15, color: "text-gray-500" }
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data in case of error
        setProductivityCategories([
          { name: "Development", value: 40, color: "text-blue-500" },
          { name: "Meetings", value: 25, color: "text-purple-500" },
          { name: "Communication", value: 20, color: "text-green-500" },
          { name: "Other", value: 15, color: "text-gray-500" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate productivity percentage
  const productiveHours = productivityData?.productiveHours || 0;
  const totalTrackedHours = productivityData?.totalTrackedHours || 0;
  const productivityPercentage = totalTrackedHours > 0 
    ? Math.round((productiveHours / totalTrackedHours) * 100) 
    : 0;
  const nonProductiveHours = totalTrackedHours - productiveHours;
  const nonProductivePercentage = totalTrackedHours > 0 ? Math.round((nonProductiveHours / totalTrackedHours) * 100) : 0;

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome to TrackPro - Monitor and manage employee activity
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-9 px-4 rounded-full border-primary/20 hover:border-primary/30 hover:bg-primary/5 transition-colors"
            onClick={() => window.location.href = "/dashboard/activity-monitoring"}
          >
            <Activity className="mr-2 h-4 w-4 text-primary" />
            View Activity
          </Button>
          <PulseButton 
            size="sm" 
            className="h-9 px-4"
            onClick={() => window.location.href = "/dashboard/employees"}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Team
          </PulseButton>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8 mb-8">
        {/* Total Employees Card */}
        <CardSpotlight color="rgba(var(--color-primary), 0.08)" className="group overflow-hidden border-l-4 border-l-primary hover:shadow-lg transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Employees</p>
                <div className="flex items-center gap-1.5">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{employees?.length || 0}</p>
                      {employees?.length > 0 ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                Active
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Team members currently tracked</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                No Data
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Check your connection or authentication</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full p-3.5 bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div 
              className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = "/dashboard/employees"}
            >
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">View all employees</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground/60 transition-all" />
            </div>
          </CardContent>
        </CardSpotlight>

        {/* Active Employees Card */}
        <CardSpotlight color="rgba(59, 130, 246, 0.08)" className="group overflow-hidden border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Employees</p>
                <div className="flex items-center gap-1.5">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{activeEmployees || 0}</p>
                      {employees?.length > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {employees.length > 0 ? Math.round((activeEmployees / employees.length) * 100) : 0}%
                        </Badge>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-1 cursor-help">
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Employees with "active" status in database</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full p-3.5 bg-gradient-to-br from-blue-500/10 to-blue-500/20 group-hover:scale-110 transition-transform duration-300 relative">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white animate-pulse"></span>
              </div>
            </div>
            <div 
              className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = "/dashboard/employees?tab=active"}
            >
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">View active employees</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground/60 transition-all" />
            </div>
          </CardContent>
        </CardSpotlight>

        {/* Productivity Card */}
        <CardSpotlight color="rgba(168, 85, 247, 0.08)" className="group overflow-hidden border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground mb-1">Productivity</p>
                <div className="flex items-center gap-1.5">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{Math.round(productivityData?.averageProductivity || 0)}%</p>
                      {productivityData?.change ? (
                        <Badge variant="secondary" className={`${productivityData.change > 0 ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'}`}>
                          {productivityData.change > 0 ? '+' : ''}{productivityData.change}%
                        </Badge>
                      ) : employees?.length === 0 ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          No Data
                        </Badge>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full p-3.5 bg-gradient-to-br from-purple-500/10 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div 
              className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = "/dashboard/activity-monitoring"}
            >
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">View productivity trends</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 group-hover:text-foreground/60 transition-all" />
            </div>
          </CardContent>
        </CardSpotlight>
      </div>

      {/* Tabs Section */}
      <div className="mt-20 mb-20">
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b mb-8 flex justify-center">
            <TabsList className="bg-muted/40 rounded-lg p-1 flex gap-2 w-fit mx-auto shadow-sm">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg border-none rounded-md px-6 h-12 font-semibold flex items-center gap-2 transition-all"
              >
                <PieChartIcon className="h-5 w-5" /> Overview
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg border-none rounded-md px-6 h-12 font-semibold flex items-center gap-2 transition-all"
              >
                <BarChart2 className="h-5 w-5" /> Team Stats
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="mt-10 space-y-10">
            {/* Productivity Overview Card with Pie Chart */}
            <CardSpotlight className="backdrop-blur-md bg-gradient-to-br from-white/80 to-primary/5 border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
              <CardHeader className="pb-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">Productivity Overview</CardTitle>
                    <CardDescription className="mt-1 text-base text-muted-foreground">Breakdown of team productivity metrics</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 rounded-full border-muted-foreground/20 hover:bg-primary/10">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    Last 7 Days
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-[320px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                    <p className="text-sm text-muted-foreground">Loading productivity data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Pie Chart */}
                    <div className="flex flex-col justify-center items-center">
                      <div className="relative h-56 w-56 bg-gradient-to-br from-primary/5 to-white/80 rounded-full shadow-lg flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Productive', value: productivityData?.productiveHours || 0, color: '#10b981' },
                                { name: 'Non-Productive', value: productivityData?.totalTrackedHours - (productivityData?.productiveHours || 0) || 0, color: '#f87171' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                              strokeWidth={2}
                              stroke="#ffffff"
                              onMouseLeave={() => setHoveredPieIndex(null)}
                            >
                              <Cell key="cell-productive" fill="#10b981" onMouseEnter={() => setHoveredPieIndex(0)} />
                              <Cell key="cell-non-productive" fill="#f87171" onMouseEnter={() => setHoveredPieIndex(1)} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none select-none">
                          {hoveredPieIndex === 0 && (
                            <>
                              <span className="text-5xl font-extrabold text-primary drop-shadow-lg">
                                {Math.round(productivityData?.averageProductivity || 0)}%
                              </span>
                              <span className="text-xs text-muted-foreground mt-1 tracking-wide">Productivity</span>
                            </>
                          )}
                          {hoveredPieIndex === 1 && (
                            <>
                              <span className="text-5xl font-extrabold text-destructive drop-shadow-lg">
                                {100 - Math.round(productivityData?.averageProductivity || 0)}%
                              </span>
                              <span className="text-xs text-muted-foreground mt-1 tracking-wide">Non-Productive</span>
                            </>
                          )}
                          {hoveredPieIndex === null && (
                            <>
                              <span className="text-lg font-semibold text-muted-foreground">Hover chart</span>
                              <span className="text-xs text-muted-foreground mt-1">for details</span>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Modern Legend */}
                      <div className="mt-6 flex justify-center gap-8">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-4 h-4 rounded-full bg-[#10b981] border-2 border-white shadow" />
                          <span className="text-sm font-medium text-primary">Productive</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-4 h-4 rounded-full bg-[#f87171] border-2 border-white shadow" />
                          <span className="text-sm font-medium text-destructive">Non-Productive</span>
                        </div>
                      </div>
                      {/* Hours Summary */}
                      <div className="mt-7 mb-7 flex flex-col gap-3 w-full max-w-xs bg-muted/40 rounded-xl p-4 shadow-inner">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>Productive Hours</span>
                          <span className="text-primary">{productiveHours.toFixed(1)}h</span>
                        </div>
                        <Progress value={(productiveHours / (totalTrackedHours || 1)) * 100} className="h-2 bg-primary/20" />
                        <div className="flex items-center justify-between text-sm font-semibold mt-2">
                          <span>Non-Productive Hours</span>
                          <span className="text-destructive">{nonProductiveHours.toFixed(1)}h</span>
                        </div>
                        <Progress value={(nonProductiveHours / (totalTrackedHours || 1)) * 100} className="h-2 bg-destructive/20" />
                      </div>
                    </div>
                    {/* Productivity by Category */}
                    <div className="flex flex-col">
                      <h3 className="text-base font-semibold mb-5 flex items-center text-primary">
                        <PieChartIcon className="h-4 w-4 mr-2 text-primary" />
                        Productivity by Category
                      </h3>
                      <div className="space-y-5">
                        {productivityCategories.map((category, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${category.color.replace('text-', 'bg-')} border-2 border-white shadow`} />
                                <span className="font-medium text-foreground/90">{category.name}</span>
                              </div>
                              <span className="font-semibold text-primary">{category.value}%</span>
                            </div>
                            <Progress value={category.value} className={`h-2 ${category.color.replace('text-', 'bg-')}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </CardSpotlight>

            {/* Getting Started Card */}
            <CardSpotlight className="backdrop-blur-sm bg-card/80 border border-border/40 hover:shadow-md transition-all duration-300">
              <CardHeader className='pb-6 pt-6'>
                <CardTitle className="text-xl flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-amber-500" />
                  Getting Started
                </CardTitle>
                <CardDescription className="mt-1">Complete these steps to set up your tracking system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="group flex transition-all p-3 rounded-lg hover:bg-muted/20">
                    <div className="mr-4 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-105 transition-transform">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Add Employees</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start by adding employees to your organization.
                      </p>
                      <Button 
                        variant="link" 
                        className="px-0 mt-1.5 h-7 text-primary group-hover:text-primary/80" 
                        size="sm"
                        onClick={() => window.location.href = "/dashboard/employees"}
                      >
                        Add Employee <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="group flex transition-all p-3 rounded-lg hover:bg-muted/20">
                    <div className="mr-4 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-105 transition-transform">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Configure Settings</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Set up monitoring preferences and company policies.
                      </p>
                      <Button 
                        variant="link" 
                        className="px-0 mt-1.5 h-7 text-primary group-hover:text-primary/80" 
                        size="sm"
                        onClick={() => window.location.href = "/dashboard/settings"}
                      >
                        Go to Settings <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="group flex transition-all p-3 rounded-lg hover:bg-muted/20">
                    <div className="mr-4 flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-105 transition-transform">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Invite Team</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Send invitations to your team members to get started.
                      </p>
                      <Button 
                        variant="link" 
                        className="px-0 mt-1.5 h-7 text-primary group-hover:text-primary/80" 
                        size="sm"
                        onClick={() => window.location.href = "/dashboard/employees"}
                      >
                        Send Invites <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CardSpotlight>
          </TabsContent>

          <TabsContent value="stats" className="mt-10">
            <CardSpotlight className="backdrop-blur-sm bg-card/80 border border-border/40 hover:shadow-md transition-all duration-300">
              <CardHeader className='pb-6 pt-6'>
                <CardTitle className="text-xl flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-green-500" />
                  Team Statistics
                </CardTitle>
                <CardDescription className="mt-1">Performance metrics for your team</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-muted/30 p-5 rounded-lg hover:bg-muted/40 transition-colors border border-muted-foreground/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center">
                          <LineChart className="h-4 w-4 mr-2 text-primary" />
                          Average Productivity
                        </h4>
                        <Badge className="bg-primary/10 text-primary border-0">
                          +12% vs last week
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                        {productivityPercentage}%
                      </div>
                    </div>
                    <div className="bg-muted/30 p-5 rounded-lg hover:bg-muted/40 transition-colors border border-muted-foreground/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          Average Work Hours
                        </h4>
                        <Badge className="bg-red-100 text-red-700 border-0">
                          -3% vs last week
                        </Badge>
                      </div>
                      <div className="text-3xl font-bold">
                        {((productiveHours + nonProductiveHours) / (employees.length || 1)).toFixed(1)} hrs/day
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </CardSpotlight>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}