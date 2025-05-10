"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Menu, Settings, HelpCircle, ChevronDown, LogOut } from "lucide-react";
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
import { useRouter } from "next/navigation";

export function Header({ onMenuClick }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(3);
  const [organizationName, setOrganizationName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user profile data from API
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/users/profile', {
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

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-md">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="flex items-center md:hidden z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick} 
          className="mr-2 hover:bg-accent rounded-full"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
      
      <div className="flex-1 max-w-md z-10">
        <div className="relative group">
          <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary/70 transition-colors" />
          <Input
            type="search"
            placeholder="Search employees, activities..."
            className="pl-8 h-9 bg-muted/30 border-muted focus:bg-background rounded-full transition-all focus:ring-2 focus:ring-primary/10 pr-4"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-1 md:gap-2 z-10">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-accent rounded-full h-9 w-9 transition-all duration-300"
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <motion.span 
                className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                {notifications}
              </motion.span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent rounded-full h-9 w-9 transition-all duration-300"
          >
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">Help</span>
          </Button>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="hover:bg-accent rounded-full h-9 w-9 transition-all duration-300"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </motion.div>
        
        <div className="h-6 w-px bg-border mx-1 hidden md:block opacity-50" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 px-2 hover:bg-accent rounded-full transition-all duration-300"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Avatar className="h-8 w-8 border border-primary/10 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-xs">
                    {getInitials(organizationName)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <span className="font-medium text-sm hidden md:block max-w-[150px] truncate">
                {isLoading ? 'Loading...' : organizationName || 'Company Name'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-1 rounded-xl border-muted/80 shadow-lg bg-card/95 backdrop-blur-sm">
            <DropdownMenuLabel className="pt-3 pb-4">
              <div className="flex flex-col space-y-1 px-1">
                <p className="text-sm font-medium">{organizationName || 'Company Name'}</p>
                <p className="text-xs text-muted-foreground">Organization Account</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-muted/50" />
            <div className="p-1">
              <DropdownMenuItem className="flex items-center gap-2 rounded-md cursor-pointer h-9 px-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 rounded-md cursor-pointer h-9 px-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-muted/50 my-1" />
              <DropdownMenuItem 
                className="flex items-center gap-2 rounded-md cursor-pointer h-9 px-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 