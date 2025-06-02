"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import {
  BuildingIcon,
  UsersIcon,
  TrendingUpIcon,
  BarChartIcon,
  CalendarIcon,
  MailIcon,
  ArrowRightIcon,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyGrowth, setMonthlyGrowth] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch organization stats
        const statsResponse = await fetch(
          "/api/organization?stats_only=true",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch organization stats");
        }

        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch organization list
        const orgsResponse = await fetch(
          "/api/organization?limit=5",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (!orgsResponse.ok) {
          throw new Error("Failed to fetch organizations");
        }

        const orgsData = await orgsResponse.json();
        setOrganizations(orgsData.organizations || []);

        // Fetch monthly growth data
        const monthlyRes = await fetch("/api/organization?stats_monthly=true", {
          headers: { "x-auth-token": token },
        });
        if (monthlyRes.ok) {
          const monthlyData = await monthlyRes.json();
          setMonthlyGrowth(monthlyData.monthly || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Animated counters
  const Counter = ({ value, label, icon }) => {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
              {loading ? (
                <Skeleton className="h-9 w-24" />
              ) : (
                <motion.h3
                  className="text-3xl font-bold"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {value || 0}
                </motion.h3>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage all organizations and employees
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Counter
          value={stats?.total_organizations}
          label="Total Organizations"
          icon={<BuildingIcon className="h-6 w-6" />}
        />
        <Counter
          value={stats?.total_employees}
          label="Total Employees"
          icon={<UsersIcon className="h-6 w-6" />}
        />
        <Counter
          value={stats?.top_organization?.employee_count || 0}
          label={`Top Org: ${stats?.top_organization?.name || 'N/A'}`}
          icon={<TrendingUpIcon className="h-6 w-6" />}
        />
        <Counter
          value={organizations.length}
          label="Active Organizations"
          icon={<BarChartIcon className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {/* Chart Card */}
        <Card className="col-span-7 md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle>Organization Growth</CardTitle>
            <CardDescription>Monthly organization registrations</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ChartContainer config={{}} className="h-72 w-full">
                <BarChart
                  width={500}
                  height={300}
                  data={monthlyGrowth.map(row => ({
                    month: row.month,
                    organizations: row.count
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="organizations" fill="#9333ea" />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Organizations Card */}
        <Card className="col-span-7 md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Recent Organizations</CardTitle>
            <CardDescription>
              Latest registered organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.recent_organizations?.slice(0, 5).map((org) => (
                  <div key={org.id} className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="font-medium">{org.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MailIcon className="mr-1 h-3 w-3" />
                        {org.email}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {formatDate(org.created_at)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => router.push("/super-admin/organizations")}
            >
              View All
              <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Organizations Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Organizations</CardTitle>
          <CardDescription>List of registered organizations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No organizations found
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>{org.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{org.employeeCount}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(org.createdAt)}</TableCell>
                      <TableCell>
                        <Link
                          href={`/super-admin/organizations/${org.id}`}
                          className="text-primary hover:underline"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => router.push("/super-admin/organizations")}
          >
            View All Organizations
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 