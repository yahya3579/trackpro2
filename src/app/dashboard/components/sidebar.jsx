"use client";

import { useState } from "react";
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
  ChevronRight,
  ChevronLeft
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useOrganization } from "@/contexts/OrganizationContext";

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
    title: "Risk Users",
    href: "/dashboard/risk-users",
    icon: AlertTriangle
  },
];

const moreItems = [
  {
    title: "Timelapse",
    href: "/dashboard/timelapse",
    icon: Clock
  },
  {
    title: "Timeline",
    href: "/dashboard/timeline",
    icon: History
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
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard
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
  const { 
    name, 
    role, 
    photoUrl, 
    isLoading, 
    getInitials 
  } = useOrganization();
  const [showMoreItems, setShowMoreItems] = useState(true);
  const [showSystemItems, setShowSystemItems] = useState(true);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    router.push('/login');
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
            <div className="rounded-md bg-gradient-to-r from-primary to-purple-600 p-1 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 10L16 14L12 18L4 10L8 6L12 2Z" fill="white" />
              </svg>
            </div>
          )}
          
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="rounded-md p-1.5 bg-card hover:bg-muted transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center py-3 mt-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        
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
            <div 
              className="mb-2 p-2 rounded-md hover:bg-muted transition-all space-y-1 cursor-pointer"
              onClick={() => router.push('/dashboard/settings')}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-primary/10 shadow-sm">
                  {photoUrl ? (
                    <AvatarImage src={photoUrl} alt={name} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-xs">
                      {getInitials(name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="truncate">
                  <p className="text-sm font-medium truncate">
                    {isLoading ? 'Loading...' : name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {role === 'organization_admin' ? 'Admin' : 'User'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className={cn(
            "grid gap-1",
            collapsed ? "px-0" : "px-2"
          )}>
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
    </>
  );
} 