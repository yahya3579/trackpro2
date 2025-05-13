"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard,
  Building,
  Users,
  Settings,
  Shield,
  BarChart3,
  Database,
  Server,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  
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
      title: "Analytics",
      href: "/super-admin/analytics",
      icon: BarChart3
    },
    {
      title: "System",
      href: "/super-admin/system",
      icon: Server
    },
    {
      title: "Database",
      href: "/super-admin/database",
      icon: Database
    },
    {
      title: "Settings",
      href: "/super-admin/settings",
      icon: Settings
    }
  ];
  
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    router.push('/login');
  };
  
  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 flex h-full flex-col border-r bg-background/80 backdrop-blur-sm transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {isSidebarOpen && (
          <Link href="/super-admin" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Admin Portal</span>
          </Link>
        )}
        {!isSidebarOpen && (
          <div className="mx-auto rounded-md bg-primary p-1">
            <Shield className="h-5 w-5 text-white" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={isSidebarOpen ? "" : "mx-auto"}
        >
          {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        <nav className="grid gap-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                pathname === item.href 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                !isSidebarOpen && "justify-center px-0"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5",
                pathname === item.href && "text-primary"
              )} />
              {isSidebarOpen && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-3 mt-auto border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            !isSidebarOpen && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isSidebarOpen && <span>Log out</span>}
        </Button>
      </div>
    </div>
  );
} 