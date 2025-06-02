"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  BuildingIcon,
  UsersIcon,
  MailIcon,
  CalendarIcon,
  ArrowLeftIcon,
  UserIcon,
  BriefcaseIcon,
} from "lucide-react";

export default function OrganizationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.id;

  const [organization, setOrganization] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        // Fetch organization info
        const orgRes = await fetch(`/api/organization/${orgId}`, {
          headers: { "x-auth-token": token },
        });
        const orgData = await orgRes.json();
        setOrganization(orgData.organization || null);

        // Fetch employees for this organization
        const empRes = await fetch(`/api/employees?organization_id=${orgId}&include_organization_info=true`, {
          headers: { "x-auth-token": token },
        });
        const empData = await empRes.json();
        setEmployees(empData.employees || []);
      } catch (err) {
        setError("Failed to load organization details.");
      } finally {
        setLoading(false);
      }
    };
    if (orgId) fetchData();
  }, [orgId, router]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.push("/super-admin/organizations")}
        className="mb-2">
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Organizations
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {organization?.photoUrl ? (
              <img
                src={organization.photoUrl}
                alt={organization?.name || "Organization Logo"}
                className="h-14 w-14 rounded-full border object-cover bg-muted"
                style={{ minWidth: 56, minHeight: 56 }}
              />
            ) : (
              <BuildingIcon className="h-14 w-14 text-primary bg-muted rounded-full p-2" />
            )}
            {loading ? <Skeleton className="h-7 w-40" /> : organization?.name || "Organization"}
          </CardTitle>
          <CardDescription>
            {loading ? <Skeleton className="h-4 w-32" /> : (
              <span className="flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                {organization?.email}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(organization?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Employees:</span>
                <Badge variant="secondary">{organization?.employeeCount || employees.length}</Badge>
              </div>
            </div>
          )}
          <Separator className="my-4" />
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <UsersIcon className="h-5 w-5" /> Employees
          </h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-muted-foreground">No employees found for this organization.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {emp.employee_name || "Unnamed"}
                      </TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                          {emp.role || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={emp.status === "active" ? "success" : emp.status === "invited" ? "warning" : emp.status === "inactive" ? "destructive" : "secondary"}>
                          {emp.status || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(emp.joined_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {/* Additional actions or info can go here */}
        </CardFooter>
      </Card>
    </div>
  );
} 