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
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-gradient-to-br from-blue-50/80 via-white/90 to-purple-50/60 backdrop-blur-md transition-all duration-300 shadow-xl",
        collapsed ? "w-[70px]" : "w-64",
        className,
        "rounded-r-2xl"
      )}
    >
      {/* Logo and Toggle */}
      <div className="flex h-16 items-center border-b px-4 bg-gradient-to-r from-blue-100/60 to-white/80 relative">
        {!collapsed && (
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight text-primary drop-shadow-sm">
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
          className="absolute right-2 top-3 h-8 w-8 rounded-full bg-white/80 shadow hover:bg-blue-100/80 border border-blue-100"
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                pathname === item.href
                  ? "bg-primary/10 text-primary shadow hover:bg-primary/20 hover:text-primary"
                  : "text-muted-foreground hover:bg-blue-100/60 hover:text-primary hover:shadow",
                "focus:outline-none focus:ring-2 focus:ring-blue-300"
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
          "border-t mt-auto bg-gradient-to-t from-blue-50/60 to-white/80",
          collapsed ? "py-3 px-2" : "py-4 px-3"
        )}
      >
        {!collapsed && (
          <div
            className="mb-2 p-2 rounded-xl bg-white/60 shadow-sm flex items-center gap-2"
          >
            <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-md">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-base">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="truncate">
              <p className="text-base font-semibold truncate text-primary">
                {isLoading ? "Loading..." : name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Super Admin
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center">
            <Avatar
              className="h-10 w-10 border-2 border-primary/20 shadow-md cursor-pointer"
              
            >
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary text-base">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full mt-4 rounded-lg shadow hover:shadow-md transition-all"
          onClick={() => {
            try {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
            } catch (error) {
              console.error("Error during logout:", error);
            } finally {
              router.push("/login");
            }
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
} 