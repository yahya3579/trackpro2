"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ArrowLeft
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { restoreOrgUserData } from "@/lib/user-storage";

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

  return (
    <div className={cn(
      "flex flex-col h-screen bg-slate-900 border-r border-slate-800 relative transition-all duration-300 ease-in-out text-white",
      collapsed ? "w-[80px]" : "w-[260px]",
      className
    )}>
      {/* Logo and collapse button */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="rounded-sm bg-blue-600 p-1">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">TrackPro</span>
              <span className="text-xs block text-slate-400">Super Admin</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="rounded-sm bg-blue-600 p-1 mx-auto">
            <Shield className="h-6 w-6 text-white" />
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute right-2 top-4 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-800",
            collapsed && "right-[-12px] bg-slate-900 border border-slate-800 shadow-sm"
          )}
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", collapsed ? "rotate-90" : "rotate-270")} />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Back to dashboard link */}
      <div className="px-4 py-3 border-b border-slate-800">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleBackToDashboard();
          }}
          className={cn(
            "flex items-center gap-2 text-sm text-slate-400 hover:text-white rounded-md py-1",
            collapsed && "justify-center"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          {!collapsed && <span>Back to Dashboard</span>}
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                pathname === item.href 
                  ? "bg-blue-600/20 text-blue-400 font-medium" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Alert status */}
      <div className="px-4 py-2 border-t border-slate-800">
        <div className={cn(
          "rounded-md py-2 px-3 flex items-center gap-3 text-sm bg-amber-950/30 text-amber-400 border border-amber-950",
          collapsed && "justify-center px-2"
        )}>
          <AlertOctagon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>3 system alerts</span>}
        </div>
      </div>

      {/* User profile section */}
      <div className="mt-auto border-t border-slate-800 p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-slate-800 flex items-center justify-center w-8 h-8">
              <User className="h-4 w-4 text-slate-300" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-medium">{userData.name}</p>
                <p className="text-xs text-slate-400">{userData.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 