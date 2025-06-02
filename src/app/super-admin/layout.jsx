"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ChevronRightIcon,
  LayoutDashboardIcon,
  BuildingIcon,
  UsersIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  SettingsIcon,
} from "lucide-react";

export default function SuperAdminLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is super_admin
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Redirect if not super_admin
      if (parsedUser.role !== "super_admin") {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/super-admin",
      icon: <LayoutDashboardIcon className="h-5 w-5" />,
    },
    {
      title: "Organizations",
      href: "/super-admin/organizations",
      icon: <BuildingIcon className="h-5 w-5" />,
    },
    {
      title: "Employees",
      href: "/super-admin/employees",
      icon: <UsersIcon className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/super-admin/settings",
      icon: <SettingsIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-4 left-4 z-50 block md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full"
        >
          {sidebarOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/40 shadow-sm transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center border-b border-border/40 px-4">
          <Link href="/super-admin" className="flex items-center space-x-2">
            <div className="rounded-md bg-primary p-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 10L16 14L12 18L4 10L8 6L12 2Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-xl">Admin Panel</span>
          </Link>
        </div>

        <div className="py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  "hover:bg-accent hover:text-accent-foreground transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="mr-3 text-muted-foreground group-hover:text-inherit">
                  {item.icon}
                </div>
                {item.title}
                <ChevronRightIcon className="ml-auto h-4 w-4 text-muted-foreground/50" />
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full border-t border-border/40 p-4">
          {user && (
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">{user.name || "Super Admin"}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 