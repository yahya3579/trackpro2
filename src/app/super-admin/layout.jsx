"use client";

import { Sidebar } from "./components/sidebar";
// import SuperAdminCheck from "@/components/super-admin-check";

export default function SuperAdminLayout({ children }) {
  return (
    <SuperAdminCheck>
      <div className="flex min-h-screen bg-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100%,rgba(0,0,255,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_90%_90%,rgba(120,20,255,0.1),transparent)]" />
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto relative">
          <div className="relative z-10 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SuperAdminCheck>
  );
} 