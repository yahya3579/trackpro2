"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Building, Users, Activity, BarChart3, Settings } from "lucide-react";

export default function SuperAdminDashboard() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: ''
  });
  
  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData({
      name: user.name || 'Admin',
      email: user.email || '',
      role: user.role || 'Admin'
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{userData.name}</p>
            <p className="text-xs text-muted-foreground">{userData.email}</p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Organizations</CardTitle>
            <Building className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Total organizations</p>
            <Button size="sm" className="mt-4 w-full" variant="outline">
              Manage Organizations
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">248</div>
            <p className="text-xs text-muted-foreground mt-1">Total users across all organizations</p>
            <Button size="sm" className="mt-4 w-full" variant="outline">
              Manage Users
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">Activity</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground mt-1">Average activity across all organizations</p>
            <Button size="sm" className="mt-4 w-full" variant="outline">
              View Activity
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">System Analytics</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-80">
            <div className="h-full w-full flex items-center justify-center border border-dashed rounded-md">
              <p className="text-muted-foreground">Analytics chart will be displayed here</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-medium">System Settings</CardTitle>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <p className="font-medium text-sm">System Maintenance</p>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="font-medium text-sm">Data Backup</p>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <p className="font-medium text-sm">Security Settings</p>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">License Management</p>
                <Button size="sm" variant="outline">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 