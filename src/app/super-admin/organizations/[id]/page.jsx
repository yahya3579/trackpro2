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
  Building,
  Users,
  Mail,
  Calendar,
  ArrowLeft,
  User,
  Briefcase,
  Shield,
  Globe,
  Clock,
  UserCheck,
  UserX,
  Phone,
  MapPin,
  Info,
  AlertCircle,
  CheckCircle
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Organization Details</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={() => router.push("/super-admin/organizations")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
          Back to Organizations
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {organization?.photoUrl ? (
              <img
                src={organization.photoUrl}
                alt={organization?.name || "Organization Logo"}
                className="h-14 w-14 rounded-full border object-cover bg-muted"
                style={{ minWidth: 56, minHeight: 56 }}
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                {organization?.name ? organization.name.charAt(0).toUpperCase() : <Building className="h-7 w-7 text-primary" />}
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">
                {loading ? <Skeleton className="h-7 w-40" /> : organization?.name || "Organization"}
              </CardTitle>
              <CardDescription>
                {loading ? <Skeleton className="h-4 w-32" /> : (
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-blue-500" />
                    {organization?.email}
                  </div>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-muted/20 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">Created:</span>
                <span>{formatDate(organization?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Employees:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <UserCheck className="h-3 w-3" />
                  {organization?.employeeCount || employees.length}
                </Badge>
              </div>
              {organization?.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Website:</span>
                  <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {organization.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {organization?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">Phone:</span>
                  <span>{organization.phone}</span>
                </div>
              )}
              {organization?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">Address:</span>
                  <span>{organization.address}</span>
                </div>
              )}
              {organization?.status && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={organization.status === "active" ? "success" : "warning"}>
                    {organization.status}
                  </Badge>
                </div>
              )}
            </div>
          )}
          <Separator className="my-4" />
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-lg">Employees</h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-8 bg-muted/10 rounded-md">
              <AlertCircle className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-muted-foreground">No employees found for this organization.</p>
            </div>
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
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {emp.employee_name ? emp.employee_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          {emp.employee_name || "Unnamed"}
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-blue-400" />
                        {emp.email}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4 text-orange-500" />
                          {emp.role || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={emp.status === "active" ? "success" : emp.status === "invited" ? "warning" : emp.status === "inactive" ? "destructive" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          {emp.status === "active" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {emp.status || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-green-500" />
                        {formatDate(emp.joined_date)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push(`/super-admin/employees?organization_id=${orgId}`)}>
            <Users className="h-4 w-4" />
            View All Employees
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 