"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Briefcase,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const pathname = usePathname();
  
  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 z-50 flex h-full flex-col border-r bg-white transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          {isSidebarOpen && (
            <Link href="/employee-dashboard" className="text-2xl font-bold text-blue-500">
              TrackPro
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="ml-auto"
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
            <div className="py-2">
                {isSidebarOpen && (
                    <p className="px-4 py-2 text-sm text-gray-500">Employee Dashboard</p>
                )}
                <NavItem
                    href='/employee-dashboard'
                    icon={<Home size={20} />}
                    label="Dashboard"
                    isSidebarOpen={isSidebarOpen}
                    isActive={pathname === '/employee-dashboard'}
                />
            </div>
          {/* Proof of work section */}
          <div className="py-2">
            {isSidebarOpen && (
              <p className="px-4 py-2 text-sm text-gray-500">Proof of work</p>
            )}
            <NavItem
              href="/employee-dashboard/my-work"
              icon={<Briefcase size={20} />}
              label="My Work"
              isSidebarOpen={isSidebarOpen}
              isActive={pathname === "/employee-dashboard/my-work"}
            />
            <NavItem
              href="/employee-dashboard/timesheet"
              icon={<Clock size={20} />}
              label="Timesheet"
              isSidebarOpen={isSidebarOpen}
              isActive={pathname === "/employee-dashboard/timesheet"}
            />
          </div>
          
          {/* Leave Management section */}
          <div className="py-2">
            {isSidebarOpen && (
              <p className="px-4 py-2 text-sm text-gray-500">Leave Management</p>
            )}
            <NavItem
              href="/employee-dashboard/apply-leave"
              icon={<Calendar size={20} />}
              label="Apply Leave"
              isSidebarOpen={isSidebarOpen}
              isActive={pathname === "/employee-dashboard/apply-leave"}
            />
            <NavItem
              href="/employee-dashboard/view-holiday"
              icon={<CalendarIcon size={20} />}
              label="View Holiday"
              isSidebarOpen={isSidebarOpen}
              isActive={pathname === "/employee-dashboard/view-holiday"}
            />
          </div>
        </div>
        
        {/* Trial notification */}
        {isSidebarOpen && (
          <div className="p-4">
            <div className="rounded-md bg-red-50 p-3 text-center">
              <p className="text-sm font-medium text-red-600">
                Trial: 7 days remaining
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}

function NavItem({ href, icon, label, isSidebarOpen, isActive }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-3 text-sm font-medium transition-colors",
        isActive 
          ? "border-l-4 border-blue-500 bg-blue-50 text-blue-600" 
          : "text-gray-700 hover:bg-gray-100",
        !isSidebarOpen && "justify-center px-0"
      )}
    >
      <span className={cn("mr-3", !isSidebarOpen && "mr-0")}>{icon}</span>
      {isSidebarOpen && <span>{label}</span>}
    </Link>
  );
} 