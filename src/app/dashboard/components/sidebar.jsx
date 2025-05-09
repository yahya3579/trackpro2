"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Activity, 
  Clock, 
  Camera, 
  Video, 
  AlertTriangle, 
  History, 
  Bell, 
  Calendar, 
  Briefcase, 
  AppWindow, 
  Settings, 
  CreditCard,
  MessageCircle,
  BarChart3,
  ChevronDown,
  LogOut,
  User,
  Home,
  ShieldAlert
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SuperAdminLoginModal } from "@/components/super-admin-login-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getUserData } from "@/lib/user-storage";

const mainItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Activity Monitoring",
    href: "/dashboard/activity-monitoring",
    icon: Activity
  },
  {
    title: "Time Tracking",
    href: "/dashboard/time-tracking",
    icon: Clock
  },
  {
    title: "Screenshots",
    href: "/dashboard/screenshots",
    icon: Camera
  },
  {
    title: "Timelapse Videos",
    href: "/dashboard/timelapse-videos",
    icon: Video
  },
  {
    title: "Risk Users",
    href: "/dashboard/risk-users",
    icon: AlertTriangle
  },
];

const moreItems = [
  {
    title: "Timeline",
    href: "/dashboard/timeline",
    icon: History
  },
  {
    title: "Real-Time Alerts",
    href: "/dashboard/real-time-alerts",
    icon: Bell
  },
  {
    title: "Leave Management",
    href: "/dashboard/leave-management",
    icon: Calendar
  },
  {
    title: "Holiday Management",
    href: "/dashboard/holiday-management",
    icon: Briefcase
  },
  {
    title: "Apps Usage",
    href: "/dashboard/apps-usage",
    icon: AppWindow
  },
];

const systemItems = [
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard
  },
  {
    title: "Testimonials",
    href: "/dashboard/testimonials",
    icon: MessageCircle
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings
  },
];

export function Sidebar({ className }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);

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
        setUserData({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        });
        
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
        setUserData({
          name: parsedUser.name || 'User',
          email: parsedUser.email || '',
          role: parsedUser.role || 'organization_admin'
        });
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Then try to fetch fresh data from API
    fetchUserProfile();
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    router.push('/login');
  };

  const handleSuperAdminClick = () => {
    setIsSuperAdminModalOpen(true);
  };

  // Function to render sidebar item with tooltip when collapsed
  const SidebarItem = ({ item, pathname, collapsed }) => {
    const isActive = pathname === item.href;
    
    if (collapsed) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-center rounded-lg w-10 h-10 mx-auto mb-1 transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.title}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      <div className={cn(
        "flex flex-col h-screen bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[260px]",
        className
      )}>
        {/* Logo and collapse button */}
        <div className="flex items-center h-16 px-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary p-1.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L20 10L16 14L12 18L4 10L8 6L12 2Z" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight">TrackPro</span>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto">
              <div className="rounded-md bg-primary p-1.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L20 10L16 14L12 18L4 10L8 6L12 2Z" fill="white" />
                </svg>
              </div>
            </div>
          )}

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "absolute right-2 top-4 rounded-full p-1 hover:bg-muted text-muted-foreground hover:text-foreground", 
              collapsed && "right-[-12px] bg-background border shadow-sm"
            )}
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", collapsed ? "rotate-90" : "rotate-270")} />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-auto py-3 px-3">
          {/* Main features */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="mb-2 px-2">
                <p className="text-xs uppercase font-medium text-muted-foreground tracking-wider">
                  Main
                </p>
              </div>
            )}
            
            {mainItems.map((item) => (
              <SidebarItem 
                key={item.href} 
                item={item} 
                pathname={pathname} 
                collapsed={collapsed} 
              />
            ))}
          </div>

          {/* More features */}
          <div className="mt-6 space-y-1">
            {!collapsed && (
              <div className="mb-2 px-2">
                <p className="text-xs uppercase font-medium text-muted-foreground tracking-wider">
                  Features
                </p>
              </div>
            )}
            
            {moreItems.map((item) => (
              <SidebarItem 
                key={item.href} 
                item={item} 
                pathname={pathname} 
                collapsed={collapsed} 
              />
            ))}
          </div>

          {/* System items */}
          <div className="mt-6 space-y-1">
            {!collapsed && (
              <div className="mb-2 px-2">
                <p className="text-xs uppercase font-medium text-muted-foreground tracking-wider">
                  System
                </p>
              </div>
            )}
            
            {systemItems.map((item) => (
              <SidebarItem 
                key={item.href} 
                item={item} 
                pathname={pathname} 
                collapsed={collapsed} 
              />
            ))}
          </div>

          {/* Super Admin Button */}
          <div className="mt-8 pt-4 border-t border-border">
            {!collapsed && (
              <p className="px-2 text-xs uppercase font-medium text-muted-foreground tracking-wider mb-2">
                Admin
              </p>
            )}
            
            {collapsed ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-center rounded-lg w-10 h-10 mx-auto text-red-500 hover:bg-red-500/10 hover:text-red-500"
                      onClick={handleSuperAdminClick}
                    >
                      <ShieldAlert className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    Super Admin Access
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all text-red-500 hover:bg-red-500/10 hover:text-red-500 justify-start font-medium"
                onClick={handleSuperAdminClick}
              >
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>Super Admin Access</span>
              </Button>
            )}
          </div>
        </div>

        {/* User profile section */}
        <div className="mt-auto border-t p-3">
          {collapsed ? (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-muted flex items-center justify-center w-10 h-10 mb-2">
                <User className="h-4 w-4" />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={handleLogout}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Log Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <div className="rounded-full bg-muted flex items-center justify-center w-10 h-10">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {isLoading ? 'Loading...' : userData.name || 'Admin User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {isLoading ? '...' : userData.email || 'admin@trackpro.com'}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted" onClick={handleLogout}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Log Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Super Admin Login Modal */}
      <SuperAdminLoginModal 
        isOpen={isSuperAdminModalOpen} 
        onClose={() => setIsSuperAdminModalOpen(false)} 
      />
    </>
  );
} 