"use client";

import { BarChart3, PieChart, Activity, Calendar, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <Button className="border-slate-700 text-white hover:text-white ">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Analytics tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="usage" className="data-[state=active]:bg-slate-700 text-white">
            System Usage
          </TabsTrigger>
          <TabsTrigger value="organizations" className="data-[state=active]:bg-slate-700 text-white">
            Organizations
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-slate-700 text-white">
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Charts would go here */}
            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>User Growth</CardTitle>
                  <div className="rounded-lg bg-slate-800 p-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <CardDescription className="text-slate-400">
                  New user signups over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-slate-800/50 rounded-md">
                <div className="text-center text-slate-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Subscription Distribution</CardTitle>
                  <div className="rounded-lg bg-slate-800 p-2">
                    <PieChart className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <CardDescription className="text-slate-400">
                  Organizations by subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-slate-800/50 rounded-md">
                <div className="text-center text-slate-400">
                  <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>System Performance</CardTitle>
                  <div className="rounded-lg bg-slate-800 p-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <CardDescription className="text-slate-400">
                  Server load and response times
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-slate-800/50 rounded-md">
                <div className="text-center text-slate-400">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Activity Timeline</CardTitle>
                  <div className="rounded-lg bg-slate-800 p-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <CardDescription className="text-slate-400">
                  System-wide activity overview
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-slate-800/50 rounded-md">
                <div className="text-center text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>System Usage Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Detailed monitoring metrics would appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] flex items-center justify-center bg-slate-800/50 rounded-md">
              <div className="text-center text-slate-400">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>System usage data visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Organization Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Growth and activity metrics by organization
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] flex items-center justify-center bg-slate-800/50 rounded-md">
              <div className="text-center text-slate-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Organization data visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                User engagement and growth metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] flex items-center justify-center bg-slate-800/50 rounded-md">
              <div className="text-center text-slate-400">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>User data visualization would appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 