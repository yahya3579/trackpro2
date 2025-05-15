"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the my-work page
    router.push('/employee-dashboard/my-work');
  }, [router]);

  // Return a minimal loading state for the brief moment before redirect
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
} 