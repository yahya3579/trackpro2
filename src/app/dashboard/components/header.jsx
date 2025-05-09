"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, Settings, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserData } from "@/lib/user-storage";

export function Header({ onMenuClick }) {
  const [notifications, setNotifications] = useState(3);
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user profile data from API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrganizationName(data.user.name);
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // First try to get data from localStorage
    try {
      const parsedUser = getUserData();
      if (parsedUser) {
        setOrganizationName(parsedUser.name || 'Company Name');
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Then try to fetch fresh data from API
    fetchUserProfile();
  }, []);

  // Get the initials of the organization name
  const getInitials = (name) => {
    if (!name) return 'CN';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center md:hidden">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="mr-2 hover:bg-muted">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees, activities..."
            className="pl-8 h-9 bg-muted/30 border-muted focus:bg-background"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="relative hover:bg-muted rounded-full h-9 w-9">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center animate-pulse">
              {notifications}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full h-9 w-9 hidden md:flex">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full h-9 w-9 hidden md:flex">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        
        <div className="h-6 w-px bg-border mx-1 hidden md:block" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted">
              <Avatar className="h-8 w-8 border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(organizationName)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden md:block max-w-[150px] truncate">
                {isLoading ? 'Loading...' : organizationName || 'Company Name'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{organizationName || 'Company Name'}</p>
                <p className="text-xs text-muted-foreground">Organization Account</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 