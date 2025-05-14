"use client";

import { useState } from "react";
import { Sidebar } from "./components/sidebar";
import { Header } from "./components/header";
import AuthCheck from "@/components/auth-check";
import { Toaster } from "@/components/ui/toaster";
import { OrganizationProvider } from "@/contexts/OrganizationContext";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthCheck>
      <OrganizationProvider>
        <div className="h-screen flex flex-col md:flex-row bg-background text-foreground overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-slate-100/[0.03] bg-[length:30px_30px] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 pointer-events-none" />
          
          {/* Mobile sidebar overlay */}
          <div
            className={`
              fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm transition-opacity duration-200
              ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Mobile sidebar */}
          <div
            className={`
              fixed inset-y-0 left-0 z-50 w-80 bg-card/95 backdrop-blur-sm border-r shadow-xl md:hidden
              transform transition-transform duration-300 ease-in-out
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <Sidebar />
          </div>

          {/* Desktop sidebar */}
          <div className="hidden md:block relative z-20">
            <Sidebar className="shadow-sm" />
          </div>

          {/* Content area */}
          <div className="flex flex-col flex-1 w-full md:w-0 min-h-screen overflow-hidden relative">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-auto p-6 bg-muted/5 relative">
              <div className="absolute inset-0 bg-grid-slate-100/[0.02] bg-[length:20px_20px] pointer-events-none" />
              <div className="container mx-auto max-w-7xl relative z-10">
                {children}
              </div>
            </main>
            <footer className="border-t py-3 px-6 text-center text-xs text-muted-foreground bg-card/50 backdrop-blur-sm">
              <p>© {new Date().getFullYear()} TrackPro. All rights reserved.</p>
            </footer>
          </div>
          
          {/* Toast notifications */}
          <Toaster />
        </div>
      </OrganizationProvider>
    </AuthCheck>
  );
} 