"use client";

import { useState, useEffect } from "react";
import { User, Mail, Briefcase, Building, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    team: '',
    joinedDate: ''
  });
  
  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Format joined date (assuming there's a created_at field, otherwise use current date)
        const joinedDate = parsedUser.created_at 
          ? new Date(parsedUser.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
        
        setUserData({
          name: parsedUser.name || 'Employee',
          email: parsedUser.email || '',
          role: parsedUser.role || 'Team Member',
          team: parsedUser.team || 'Development Team',
          joinedDate: joinedDate
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your account information
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>
              Your personal details as they appear in our system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Full Name</p>
                <p className="text-base">{userData.name}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Email Address</p>
                <p className="text-base">{userData.email}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Joined Date</p>
                <p className="text-base">{userData.joinedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Work Information</CardTitle>
            <CardDescription>
              Details about your work position and team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Role</p>
                <p className="text-base">{userData.role}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Team</p>
                <p className="text-base">{userData.team}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 