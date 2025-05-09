"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard,
  Building,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  FileText,
  HelpCircle,
  Shield,
  AlertOctagon,
  LogOut,
  User,
  ChevronDown,
  ArrowLeft,
  AlertTriangle,
  Plus
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { restoreOrgUserData } from "@/lib/user-storage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/super-admin",
    icon: LayoutDashboard
  },
  {
    title: "Organizations",
    href: "/super-admin/organizations",
    icon: Building
  },
  {
    title: "Users",
    href: "/super-admin/users",
    icon: Users
  },
  {
    title: "Billing & Subscriptions",
    href: "/super-admin/billing",
    icon: CreditCard
  },
  {
    title: "Analytics",
    href: "/super-admin/analytics",
    icon: BarChart3
  },
  {
    title: "Settings",
    href: "/super-admin/settings",
    icon: Settings
  },
  {
    title: "System Logs",
    href: "/super-admin/system-logs",
    icon: FileText
  },
  {
    title: "Help Center",
    href: "/super-admin/help-center",
    icon: HelpCircle
  }
];

export function Sidebar({ className }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Super Admin',
    email: 'admin@trackpro.com'
  });
  const [alertsCount, setAlertsCount] = useState(3);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData({
          name: parsedUser.name || 'Super Admin',
          email: parsedUser.email || 'admin@trackpro.com'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to dashboard page
    router.push('/dashboard');
  };

  const handleBackToDashboard = () => {
    // Restore the original organization user data for dashboard
    restoreOrgUserData();
    
    router.push('/dashboard');
  };

  // Function to render sidebar item based on collapsed state
  const SidebarItem = ({ item, isActive }) => {
    if (collapsed) {
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-300",
                  isActive 
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(0,100,255,0.5)]"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-lg border border-blue-400/50 z-[-1]"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/90 text-white border-blue-900">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 rounded-lg pl-3 pr-3 py-2 text-sm transition-all duration-200 group",
          isActive 
            ? "bg-blue-600 text-white font-medium shadow-[0_0_15px_rgba(0,100,255,0.3)]"
            : "text-white/50 hover:text-white hover:bg-white/10"
        )}
      >
        <span className="flex items-center justify-center w-7 h-7">
          <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110")} />
        </span>
        <span className="transition-transform group-hover:translate-x-1">{item.title}</span>
        {isActive && (
          <motion.div
            layoutId="sidebar-indicator"
            className="absolute inset-0 rounded-lg border border-blue-400/50 z-[-1]"
            transition={{ type: "spring", duration: 0.5 }}
          />
        )}
      </Link>
    );
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-black/80 backdrop-blur-md border-r border-blue-900/30 transition-all duration-300 ease-in-out z-20 relative",
      collapsed ? "w-[70px]" : "w-[260px]",
      className
    )}>
      {/* Glow effects */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,100,255,0.15),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(0,100,255,0.1),transparent)] pointer-events-none" />
      
      {/* Logo and collapse button */}
      <div className="flex justify-between items-center h-16 px-4 border-b border-blue-900/30 relative">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="rounded-md bg-gradient-to-br from-blue-500 to-indigo-700 p-1.5 shadow-[0_0_15px_rgba(0,100,255,0.5)]">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">TrackPro</span>
              <span className="text-xs block text-blue-300">Super Admin</span>
            </div>
          </motion.div>
        )}
        
        {collapsed && (
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto"
          >
            <div className="rounded-md bg-gradient-to-br from-blue-500 to-indigo-700 p-1.5 shadow-[0_0_15px_rgba(0,100,255,0.5)]">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </motion.div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-full p-1.5 text-blue-300 hover:text-white hover:bg-white/10 transition-all",
            collapsed ? "absolute -right-3 top-7 bg-black border border-blue-900/50 shadow-lg" : ""
          )}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </button>
      </div>

      {/* Back to dashboard link */}
      <div className="px-4 py-3 border-b border-blue-900/30">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleBackToDashboard();
          }}
          className={cn(
            "flex items-center gap-2 text-sm text-blue-300 hover:text-white rounded-md py-1 transition-colors",
            collapsed && "justify-center"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {!collapsed && <span>Back to Dashboard</span>}
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-auto py-3 px-2">
        <nav className="grid gap-1.5">
          {sidebarItems.map((item) => (
            <SidebarItem key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </nav>
      </div>

      {/* Alert status */}
      {alertsCount > 0 && (
        <div className="px-4 py-3 border-t border-blue-900/30">
          <motion.div 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 1.5 
            }}
            className={cn(
              "relative rounded-md py-2 px-3 flex items-center gap-3 text-sm overflow-hidden",
              collapsed ? "justify-center px-2" : ""
            )}
          >
            <div className="absolute inset-0 bg-amber-950/30 backdrop-blur-sm border border-amber-500/30 rounded-md z-[-1]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,200,0,0.1),transparent)] z-[-1]" />
            
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </motion.div>
            {!collapsed && (
              <span className="text-amber-300 font-medium">{alertsCount} system alerts</span>
            )}
          </motion.div>
        </div>
      )}

      {/* User profile section */}
      <div className="mt-auto border-t border-blue-900/30 p-4">
        <div className={collapsed ? "flex justify-center" : "flex items-center gap-3"}>
          <div className="rounded-full bg-gradient-to-br from-blue-800 to-indigo-900 p-0.5 shadow-[0_0_10px_rgba(0,100,255,0.3)]">
            <div className="rounded-full bg-black/50 flex items-center justify-center w-8 h-8">
              <User className="h-4 w-4 text-blue-300" />
            </div>
          </div>
          
          {!collapsed && (
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">{userData.name}</p>
              <p className="text-xs text-blue-300 truncate">{userData.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 