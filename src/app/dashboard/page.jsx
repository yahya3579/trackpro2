// "use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, Users, Clock, BarChart2, FileText, Activity, ChevronRight, LineChart, Calendar, Settings, Mail, User } from "lucide-react";

export const metadata = {
  title: "Dashboard | TrackPro",
  description: "Employee Monitoring Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to TrackPro - Monitor and manage employee activity
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="sm" variant="outline" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button size="sm" className="h-9">
            <Users className="mr-2 h-4 w-4" />
            Manage Team
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-l-4 border-l-primary">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">45</p>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-emerald-100 text-emerald-700">+3</span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="bg-muted/50 h-12 flex items-center px-6">
              <span className="text-xs font-medium text-muted-foreground">View all employees</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-blue-500">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">32</p>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-blue-100 text-blue-700">71%</span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="bg-muted/50 h-12 flex items-center px-6">
              <span className="text-xs font-medium text-muted-foreground">Monitor live activity</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-purple-500">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Productivity</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">83%</p>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-purple-100 text-purple-700">+5%</span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-purple-500/10">
                <BarChart2 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="bg-muted/50 h-12 flex items-center px-6">
              <span className="text-xs font-medium text-muted-foreground">View productivity trends</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-amber-500">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Reports</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">12</p>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-amber-100 text-amber-700">This month</span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-amber-500/10">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="bg-muted/50 h-12 flex items-center px-6">
              <span className="text-xs font-medium text-muted-foreground">Generate new report</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto p-1">
          <TabsTrigger value="overview" className="text-sm py-2">Overview</TabsTrigger>
          <TabsTrigger value="activity" className="text-sm py-2">Recent Activity</TabsTrigger>
          <TabsTrigger value="stats" className="text-sm py-2">Team Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Chart Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Productivity Overview</CardTitle>
                  <CardDescription>Daily productivity metrics for your team</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  <LineChart className="h-3.5 w-3.5 mr-1" />
                  Last 7 Days
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[240px] w-full flex items-center justify-center">
              <div className="text-muted-foreground text-sm">
                Productivity Chart Placeholder
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Card */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Complete these steps to set up your tracking system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex">
                  <div className="mr-4 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Add Employees</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start by adding employees to your organization.
                    </p>
                    <Button variant="link" className="px-0 mt-1 h-7 text-primary" size="sm">
                      Add Employee <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Configure Settings</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set up monitoring preferences and company policies.
                    </p>
                    <Button variant="link" className="px-0 mt-1 h-7 text-primary" size="sm">
                      Go to Settings <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-4 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Invite Team</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send invitations to your team members to get started.
                    </p>
                    <Button variant="link" className="px-0 mt-1 h-7 text-primary" size="sm">
                      Send Invites <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Employee activity from the past 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex">
                    <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-foreground" />
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
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Activity</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Statistics</CardTitle>
              <CardDescription>Performance metrics for your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Average Work Hours
                  </h3>
                  <p className="text-2xl font-bold mt-2">7.5 hrs/day</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="text-emerald-600">↑ 0.5 hrs</span> from last month
                  </div>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Task Completion Rate
                  </h3>
                  <p className="text-2xl font-bold mt-2">92%</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="text-emerald-600">↑ 3%</span> from last month
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View Detailed Stats</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 