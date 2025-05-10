"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  ShieldAlert,
  ChevronRight,
  ChevronLeft
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
    title: "Employees",
    href: "/dashboard/employees",
    icon: User
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
  const [showMoreItems, setShowMoreItems] = useState(true);
  const [showSystemItems, setShowSystemItems] = useState(true);

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
                  "flex items-center justify-center rounded-md w-10 h-10 mx-auto mb-1 transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "text-primary"
                )} />
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
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-300 group",
          isActive
            ? "bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary font-medium shadow-sm"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <span className={cn(
          "relative flex items-center justify-center w-7 h-7",
          isActive && "text-primary"
        )}>
          <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
          {isActive && (
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary/10 -z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            />
          )}
        </span>
        <span className="transition-all group-hover:translate-x-1">{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      <div className={cn(
        "flex flex-col h-screen bg-card/80 backdrop-blur-sm transition-all duration-300 ease-in-out border-r shadow-sm relative",
        collapsed ? "w-[70px]" : "w-[260px]",
        className
      )}>
        {/* Gradient overlay at the top */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        
        {/* Logo and collapse button */}
        <div className={cn(
          "flex h-16 items-center border-b px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center">
              <div className="rounded-md bg-gradient-to-r from-primary to-purple-600 p-1 mr-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L20 10L16 14L12 18L4 10L8 6L12 2Z" fill="white" />
                </svg>
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                TrackPro
              </span>
            </Link>
          )}
          
          {collapsed && (
            <div className="rounded-md bg-gradient-to-r from-primary to-purple-600 p-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 10L16 14L12 18L4 10L8 6L12 2Z" fill="white" />
              </svg>
            </div>
          )}
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "rounded-md p-1.5 hover:bg-muted transition-colors",
              collapsed && "absolute -right-10 top-3 bg-card shadow border"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {/* Nav sections */}
        <div className="flex-1 overflow-auto py-2 px-3">
          {/* Main Items */}
          <div className="mb-4">
            {!collapsed && (
              <div className="px-4 py-2">
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Main Menu
                </h4>
              </div>
            )}
            <nav className="grid gap-1 px-2">
              {mainItems.map((item) => (
                <SidebarItem 
                  key={item.href} 
                  item={item} 
                  pathname={pathname}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </div>

          {/* More Items */}
          <div className="mb-4">
            {!collapsed && (
              <div className="px-4 py-2 flex justify-between items-center">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Features
                </h4>
                <button
                  onClick={() => setShowMoreItems(!showMoreItems)}
                  className="rounded-md p-1 hover:bg-muted transition-colors"
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    showMoreItems && "rotate-180"
                  )} />
                </button>
              </div>
            )}
            {showMoreItems && (
              <nav className="grid gap-1 px-2">
                {moreItems.map((item) => (
                  <SidebarItem 
                    key={item.href} 
                    item={item} 
                    pathname={pathname}
                    collapsed={collapsed}
                  />
                ))}
              </nav>
            )}
          </div>

          {/* System Items */}
          <div className="mb-4">
            {!collapsed && (
              <div className="px-4 py-2 flex justify-between items-center">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  System
                </h4>
                <button
                  onClick={() => setShowSystemItems(!showSystemItems)}
                  className="rounded-md p-1 hover:bg-muted transition-colors"
                >
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform",
                    showSystemItems && "rotate-180"
                  )} />
                </button>
              </div>
            )}
            {showSystemItems && (
              <nav className="grid gap-1 px-2">
                {systemItems.map((item) => (
                  <SidebarItem 
                    key={item.href} 
                    item={item} 
                    pathname={pathname}
                    collapsed={collapsed}
                  />
                ))}
              </nav>
            )}
          </div>
        </div>
        
        {/* User and Actions */}
        <div className={cn(
          "border-t mt-auto",
          collapsed ? "py-3 px-2" : "py-4 px-3"
        )}>
          {!collapsed && (
            <div className="mb-2 p-2 rounded-md hover:bg-muted transition-all space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate">
                    {isLoading ? 'Loading...' : userData.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userData.role === 'organization_admin' ? 'Admin' : 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className={cn(
            "grid gap-1",
            collapsed ? "px-0" : "px-2"
          )}>
            {userData.role !== 'super_admin' && !collapsed && (
              <Button
                variant="outline"
                size="sm"
                className="justify-start text-xs bg-gradient-to-r from-primary/5 to-purple-500/5 border-muted-foreground/20 hover:from-primary/10 hover:to-purple-500/10"
                onClick={handleSuperAdminClick}
              >
                <ShieldAlert className="h-3.5 w-3.5 mr-2 text-primary" />
                <span>Super Admin Login</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                collapsed ? "h-9 w-9 p-0 flex items-center justify-center mx-auto" : "justify-start text-xs"
              )}
              onClick={handleLogout}
            >
              <LogOut className={cn(
                "h-3.5 w-3.5",
                !collapsed && "mr-2"
              )} />
              {!collapsed && <span>Log out</span>}
            </Button>
          </div>
        </div>
        
        {/* Gradient overlay at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none"></div>
      </div>
      
      {isSuperAdminModalOpen && (
        <SuperAdminLoginModal
          isOpen={isSuperAdminModalOpen}
          onClose={() => setIsSuperAdminModalOpen(false)}
        />
      )}
    </>
  );
} 