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
  PieChart,
  TrendingUp
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all employees data
        const employeesResponse = await fetch('/api/employees?limit=1000');
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData.employees || []);
        
        // Fetch active employees data
        const activeResponse = await fetch('/api/activity-monitoring/active-users');
        const activeData = await activeResponse.json();
        setActiveEmployees(activeData.activeCount || 0);
        
        // Fetch productivity data
        const productivityResponse = await fetch('/api/activity-monitoring/productivity-summary');
        const productivityData = await productivityResponse.json();
        setProductivityData({
          averageProductivity: productivityData.overallRate || 0,
          productiveHours: productivityData.productiveHours || 0,
          totalTrackedHours: productivityData.totalHours || 0,
          change: productivityData.weeklyChange || 0
        });
        
        // Fetch productivity categories data
        const categoriesResponse = await fetch('/api/activity-monitoring/categories');
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
  const productivityPercentage = productivityData?.averageProductivity || 0;
  const productiveHours = productivityData?.productiveHours || 0;
  const totalTrackedHours = productivityData?.totalTrackedHours || 0;
  const nonProductiveHours = totalTrackedHours - productiveHours;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            className="h-9 rounded-full border-primary/20 hover:border-primary/30 hover:bg-primary/5"
            onClick={() => window.location.href = "/dashboard/activity-monitoring"}
          >
            <Activity className="mr-2 h-4 w-4 text-primary" />
            View Activity
          </Button>
          <PulseButton 
            size="sm" 
            className="h-9"
            onClick={() => window.location.href = "/dashboard/employees"}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Team
          </PulseButton>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Employees Card */}
        <CardSpotlight color="rgba(var(--color-primary), 0.08)" className="group overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <div className="flex items-center gap-1">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{employees.length}</p>
                      {employees.length > 0 && (
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
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div 
              className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = "/dashboard/employees"}
            >
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">View all employees</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </CardContent>
        </CardSpotlight>

        {/* Active Now Card */}
        <CardSpotlight color="rgba(59, 130, 246, 0.08)" className="group overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                <div className="flex items-center gap-1">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{activeEmployees}</p>
                      {employees.length > 0 && activeEmployees > 0 && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {Math.round((activeEmployees / employees.length) * 100)}%
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/20 group-hover:scale-105 transition-transform relative">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white animate-pulse"></span>
              </div>
            </div>
            <div 
              className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = "/dashboard/activity-monitoring"}
            >
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">Monitor live activity</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </CardContent>
        </CardSpotlight>

        {/* Productivity Card */}
        <CardSpotlight color="rgba(168, 85, 247, 0.08)" className="group overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Productivity</p>
                <div className="flex items-center gap-1">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{productivityPercentage}%</p>
                      {productivityData?.change && (
                        <Badge variant="secondary" className={`${productivityData.change > 0 ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'}`}>
                          {productivityData.change > 0 ? '+' : ''}{productivityData.change}%
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-br from-purple-500/10 to-purple-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div 
              className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => window.location.href = "/dashboard/activity-monitoring"}
            >
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">View productivity trends</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </CardContent>
        </CardSpotlight>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="border-b mb-4">
          <TabsList className="bg-transparent p-0 h-10 w-full md:w-auto">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 h-10"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 h-10"
            >
              Recent Activity
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-4 h-10"
            >
              Team Stats
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Productivity Overview Card with Pie Chart */}
          <CardSpotlight className="backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Productivity Overview</CardTitle>
                  <CardDescription>Breakdown of team productivity metrics</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-full border-muted-foreground/20">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-primary" />
                  Last 7 Days
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[320px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Loading productivity data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <div className="flex flex-col justify-center items-center">
                    <div className="relative h-48 w-48">
                      <PieChart className="h-48 w-48 text-muted-foreground/30" />
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold text-primary">{productivityPercentage}%</span>
                        <span className="text-xs text-muted-foreground">Productivity</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Productive Hours</span>
                        <span>{productiveHours}h</span>
                      </div>
                      <Progress value={(productiveHours / totalTrackedHours) * 100} className="h-2 bg-muted" />
                      
                      <div className="flex items-center justify-between text-sm font-medium mt-2">
                        <span>Non-Productive Hours</span>
                        <span>{nonProductiveHours}h</span>
                      </div>
                      <Progress value={(nonProductiveHours / totalTrackedHours) * 100} className="h-2 bg-muted" />
                    </div>
                  </div>
                  
                  {/* Productivity by Category */}
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium mb-4">Productivity by Category</h3>
                    <div className="space-y-4">
                      {productivityCategories.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`h-3 w-3 rounded-full ${category.color.replace('text-', 'bg-')}`}></div>
                              <span>{category.name}</span>
                            </div>
                            <span className="font-medium">{category.value}%</span>
                          </div>
                          <Progress value={category.value} className={`h-1.5 ${category.color.replace('text-', 'bg-')}`} />
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-auto self-start rounded-full bg-card border-muted-foreground/20 hover:bg-primary/5 hover:border-primary/20"
                      onClick={() => window.location.href = "/dashboard/activity-monitoring"}
                    >
                      View Detailed Report
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </CardSpotlight>

          {/* Getting Started Card */}
          <CardSpotlight className="backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Complete these steps to set up your tracking system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="group flex transition-all">
                  <div className="mr-4 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-105 transition-transform">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Add Employees</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start by adding employees to your organization.
                    </p>
                    <Button 
                      variant="link" 
                      className="px-0 mt-1 h-7 text-primary group-hover:text-primary/80" 
                      size="sm"
                      onClick={() => window.location.href = "/dashboard/employees"}
                    >
                      Add Employee <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
                
                <div className="group flex transition-all">
                  <div className="mr-4 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-105 transition-transform">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Configure Settings</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set up monitoring preferences and company policies.
                    </p>
                    <Button 
                      variant="link" 
                      className="px-0 mt-1 h-7 text-primary group-hover:text-primary/80" 
                      size="sm"
                      onClick={() => window.location.href = "/dashboard/settings"}
                    >
                      Go to Settings <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
                
                <div className="group flex transition-all">
                  <div className="mr-4 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-105 transition-transform">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Invite Team</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send invitations to your team members to get started.
                    </p>
                    <Button 
                      variant="link" 
                      className="px-0 mt-1 h-7 text-primary group-hover:text-primary/80" 
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

        <TabsContent value="activity" className="mt-6">
          <CardSpotlight className="backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Employee activity from the past 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex">
                      <Skeleton className="h-10 w-10 rounded-full mr-4" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-2 w-1/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex group">
                      <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted/50 to-muted group-hover:from-primary/10 group-hover:to-primary/20 transition-all">
                        <User className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">John Doe</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Completed milestone on Project X
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full rounded-full border-muted-foreground/20 hover:border-primary/20 hover:bg-primary/5"
                onClick={() => window.location.href = "/dashboard/activity-monitoring"}
              >
                View All Activity
              </Button>
            </CardFooter>
          </CardSpotlight>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <CardSpotlight className="backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
              <CardDescription>Performance metrics for your team</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted/30 p-4 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Average Productivity</h4>
                      <Badge className="bg-primary/10 text-primary border-0">
                        +12% vs last week
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                      {productivityPercentage}%
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Average Work Hours</h4>
                      <Badge className="bg-primary/10 text-primary border-0">
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
  );
}