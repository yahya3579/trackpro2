// "use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, Users, Clock, BarChart2, FileText, Activity, ChevronRight, LineChart, Calendar, Settings, Mail, User } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { PulseButton } from "@/components/ui/aceternity-button";

export const metadata = {
  title: "Dashboard | TrackPro",
  description: "Employee Monitoring Dashboard",
};

export default function DashboardPage() {
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
          <Button size="sm" variant="outline" className="h-9 rounded-full border-primary/20 hover:border-primary/30 hover:bg-primary/5">
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            View Reports
          </Button>
          <PulseButton size="sm" className="h-9">
            <Users className="mr-2 h-4 w-4" />
            Manage Team
          </PulseButton>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSpotlight color="rgba(var(--color-primary), 0.08)" className="group overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">45</p>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-emerald-100 text-emerald-700">+3</span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-br from-primary/10 to-primary/20 group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">View all employees</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </CardContent>
        </CardSpotlight>

        <CardSpotlight color="rgba(59, 130, 246, 0.08)" className="group overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Active Now</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">32</p>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-blue-100 text-blue-700">71%</span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-br from-blue-500/10 to-blue-500/20 group-hover:scale-105 transition-transform">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">Monitor live activity</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </CardContent>
        </CardSpotlight>

        <CardSpotlight color="rgba(168, 85, 247, 0.08)" className="group overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Productivity</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">83%</p>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-purple-100 text-purple-700">+5%</span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-br from-purple-500/10 to-purple-500/20 group-hover:scale-105 transition-transform">
                <BarChart2 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">View productivity trends</span>
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </CardContent>
        </CardSpotlight>

        <CardSpotlight color="rgba(245, 158, 11, 0.08)" className="group overflow-hidden border-l-4 border-l-amber-500 hover:shadow-md transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6">
              <div className="flex flex-col">
                <p className="text-sm font-medium text-muted-foreground">Reports</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">12</p>
                  <span className="text-xs rounded-full px-1.5 py-0.5 bg-amber-100 text-amber-700">This month</span>
                </div>
              </div>
              <div className="rounded-full p-3 bg-gradient-to-br from-amber-500/10 to-amber-500/20 group-hover:scale-105 transition-transform">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="bg-muted/30 h-12 flex items-center px-6 group-hover:bg-muted/50 transition-colors">
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground/80 transition-colors">Generate new report</span>
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
          {/* Chart Card */}
          <CardSpotlight className="backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Productivity Overview</CardTitle>
                  <CardDescription>Daily productivity metrics for your team</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-full border-muted-foreground/20">
                  <LineChart className="h-3.5 w-3.5 mr-1 text-primary" />
                  Last 7 Days
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[240px] w-full flex items-center justify-center">
              <div className="text-muted-foreground text-sm">
                Productivity Chart Placeholder
              </div>
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
                    <Button variant="link" className="px-0 mt-1 h-7 text-primary group-hover:text-primary/80" size="sm">
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
                    <Button variant="link" className="px-0 mt-1 h-7 text-primary group-hover:text-primary/80" size="sm">
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
                    <Button variant="link" className="px-0 mt-1 h-7 text-primary group-hover:text-primary/80" size="sm">
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
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full rounded-full border-muted-foreground/20 hover:border-primary/20 hover:bg-primary/5"
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/30 p-4 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Average Productivity</h4>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      +12% vs last week
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                    78%
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Average Work Hours</h4>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      -3% vs last week
                    </span>
                  </div>
                  <div className="text-3xl font-bold">
                    6.8 hrs/day
                  </div>
                </div>
              </div>
            </CardContent>
          </CardSpotlight>
        </TabsContent>
      </Tabs>
    </div>
  );
}