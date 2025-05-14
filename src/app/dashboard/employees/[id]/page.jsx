"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEmployee() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/employees?id=${id}`, {
          headers: { "x-auth-token": token },
        });
        if (!res.ok) throw new Error("Failed to fetch employee");
        const data = await res.json();
        // If API returns a list, find the employee by id
        let emp = data.employee || data.employees?.find(e => String(e.id) === String(id));
        if (!emp && data.employees && data.employees.length === 1) emp = data.employees[0];
        setEmployee(emp);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive mb-2">{error}</p>
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-2">Employee not found</p>
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl py-10">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <Card>
        <CardHeader>
          <CardTitle>Employee Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="font-semibold">Name: </span>
              {employee.employee_name || `${employee.first_name || ''} ${employee.last_name || ''}`}
            </div>
            <div>
              <span className="font-semibold">Email: </span>
              {employee.email}
            </div>
            <div>
              <span className="font-semibold">Position: </span>
              {employee.position || employee.role || '—'}
            </div>
            <div>
              <span className="font-semibold">Department: </span>
              {employee.department || employee.team_name || '—'}
            </div>
            <div>
              <span className="font-semibold">Status: </span>
              {employee.status}
            </div>
            <div>
              <span className="font-semibold">Joined Date: </span>
              {employee.joined_date || employee.hire_date || '—'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 