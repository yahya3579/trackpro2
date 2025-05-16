"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Clock,
  Calendar, 
  Image, 
  ShieldCheck, 
  Settings,
  Globe,
  FileText,
  ClipboardCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function Sidebar({ className }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [name, setName] = useState("Super Admin");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setName(user.name || "Super Admin");
        setPhotoUrl(user.profilePicture || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return "SA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const navigation = [
    {
      title: "Dashboard",
      href: "/super-admin-dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Employee Overview",
      href: "/super-admin-dashboard/employees",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Leave Requests",
      href: "/super-admin-dashboard/leave-requests",
      icon: <ClipboardCheck className="h-5 w-5" />,
    },
    {
      title: "Screenshots",
      href: "/super-admin-dashboard/screenshots",
      icon: <Image className="h-5 w-5" />,
    },
    {
      title: "Holidays",
      href: "/super-admin-dashboard/holidays",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Time Tracking",
      href: "/super-admin-dashboard/time-tracking",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/super-admin-dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-[70px]" : "w-64",
        className
      )}
    >
      {/* Logo and Toggle */}
      <div className="flex h-16 items-center border-b px-4">
        {!collapsed && (
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>TrackPro Admin</span>
          </div>
        )}
        {collapsed && (
          <div className="flex w-full justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-3 h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {navigation.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* User and Actions */}
      <div
        className={cn(
          "border-t mt-auto",
          collapsed ? "py-3 px-2" : "py-4 px-3"
        )}
      >
        {!collapsed && (
          <div
            className="mb-2 p-2 rounded-md hover:bg-muted transition-all space-y-1 cursor-pointer"
            onClick={() => router.push("/super-admin-dashboard/settings")}
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
                  {isLoading ? "Loading..." : name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center">
            <Avatar
              className="h-8 w-8 border border-primary/10 shadow-sm cursor-pointer"
              onClick={() => router.push("/super-admin-dashboard/settings")}
            >
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-xs">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
} 