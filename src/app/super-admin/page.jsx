"use client";

import { useState, useEffect } from "react";
import SuperAdminCheck from "@/components/super-admin-check";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Building, ChevronLeft, BarChart3, CreditCard, Users, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    username: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name || 'Super Admin',
          email: parsedUser.email || 'admin@trackpro.com',
          username: parsedUser.username || 'admin'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <SuperAdminCheck>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
          <Button className="border-slate-700 text-white hover:text-white hover:bg-blue-700">
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">34</div>
                  <p className="text-xs text-slate-400 mt-1">3 added this month</p>
                </div>
                <div className="rounded-full p-2 bg-blue-600/20">
                  <Building className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">245</div>
                  <p className="text-xs text-slate-400 mt-1">+18% from last month</p>
                </div>
                <div className="rounded-full p-2 bg-green-600/20">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">$12,850</div>
                  <p className="text-xs text-slate-400 mt-1">+24% from last month</p>
                </div>
                <div className="rounded-full p-2 bg-emerald-600/20">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">99.9%</div>
                  <p className="text-xs text-slate-400 mt-1">Last 30 days</p>
                </div>
                <div className="rounded-full p-2 bg-purple-600/20">
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription className="text-slate-400">Overview of system usage across organizations</CardDescription>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <div className="text-slate-500 text-sm">
                [Analytics Chart Placeholder]
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Super Admin Accounts</CardTitle>
              <CardDescription className="text-slate-400">System administrators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                  <div className="rounded-full bg-slate-800 flex items-center justify-center w-10 h-10">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{userData.name || 'Super Admin'}</p>
                    <p className="text-xs text-slate-400">{userData.email || 'superadmin@trackpro.com'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                  <div className="rounded-full bg-slate-800 flex items-center justify-center w-10 h-10">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">John Doe</p>
                    <p className="text-xs text-slate-400">john@trackpro.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                  <div className="rounded-full bg-slate-800 flex items-center justify-center w-10 h-10">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Jane Smith</p>
                    <p className="text-xs text-slate-400">jane@trackpro.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push('/super-admin/settings')} className="w-full border-slate-700 text-white hover:text-white hover:bg-blue-700">
                Manage Admins
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-slate-400">System-wide activity log</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3 p-3 rounded-lg bg-slate-800/50">
                  <div className="rounded-full bg-blue-600/20 flex-shrink-0 flex items-center justify-center w-10 h-10">
                    <Building className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New organization registered</p>
                    <p className="text-xs text-slate-400">Today, 10:30 AM</p>
                    <p className="text-xs text-slate-400 mt-1">TechMasters Inc. registered with Business plan</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 rounded-lg bg-slate-800/50">
                  <div className="rounded-full bg-green-600/20 flex-shrink-0 flex items-center justify-center w-10 h-10">
                    <CreditCard className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">User subscription upgraded</p>
                    <p className="text-xs text-slate-400">Yesterday, 2:15 PM</p>
                    <p className="text-xs text-slate-400 mt-1">DataFlow Solutions upgraded from Standard to Business plan</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 rounded-lg bg-slate-800/50">
                  <div className="rounded-full bg-purple-600/20 flex-shrink-0 flex items-center justify-center w-10 h-10">
                    <Shield className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">System maintenance completed</p>
                    <p className="text-xs text-slate-400">May 15, 2023, 6:00 PM</p>
                    <p className="text-xs text-slate-400 mt-1">Database optimization and security patch deployment</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="px-0 text-blue-400 hover:text-blue-300">
                View all activity
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </SuperAdminCheck>
  );
} 