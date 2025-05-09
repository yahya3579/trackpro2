"use client";

import { Sidebar } from "./components/sidebar";
import SuperAdminCheck from "@/components/super-admin-check";

export default function SuperAdminLayout({ children }) {
  return (
    <SuperAdminCheck>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </SuperAdminCheck>
  );
} 