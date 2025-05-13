"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import SuperAdminAuthCheck from "@/components/super-admin-auth-check";
import { Sidebar } from "./components/sidebar";

export default function SuperAdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  return (
    <SuperAdminAuthCheck>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className={cn(
          "flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-16"
        )}>
          {children}
        </main>
      </div>
    </SuperAdminAuthCheck>
  );
} 