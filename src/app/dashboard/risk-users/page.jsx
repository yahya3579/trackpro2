"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Users,
  Clock,
  Search,
  Filter,
  BarChart,
  MousePointerClick,
  Hourglass,
  Calendar,
  ArrowUpDown,
  X,
  Calendar as CalendarIcon,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";

// export const metadata = {
//   title: "Risk Users | TrackPro",
//   description: "Monitor employees with risky behavior patterns",
// };

export default function RiskUsersPage() {
  const router = useRouter();
  const [riskUsers, setRiskUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [riskType, setRiskType] = useState("all");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRiskUsers();
  }, []);

  useEffect(() => {
    filterRiskUsers();
  }, [riskUsers, activeTab, searchQuery, riskType]);

  const fetchRiskUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // First check if we have a dedicated risk-users API endpoint
      let response;
      try {
        response = await fetch("/api/risk-users", {
          headers: {
            "x-auth-token": token,
          },
        });
      } catch (error) {
        console.log("Dedicated risk-users API not available, using alternative approach");
      }

      // If dedicated endpoint isn't available or fails, we'll calculate risk users from existing data
      if (!response || !response.ok) {
        // Fetch all employees first
        const employeesResponse = await fetch("/api/employees", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!employeesResponse.ok) {
          throw new Error("Failed to fetch employees");
        }

        const employeesData = await employeesResponse.json();
        const employees = employeesData.employees || [];

        // Fetch productivity data for each employee
        const productivityResponse = await fetch("/api/activity-monitoring/employee-productivity", {
          headers: {
            "x-auth-token": token,
          },
        });

        if (!productivityResponse.ok) {
          throw new Error("Failed to fetch productivity data");
        }

        const productivityData = await productivityResponse.json();
        const employeeProductivity = productivityData.employees || [];

        // Identify risk users based on criteria
        const riskyUsers = employees.map(employee => {
          // Find productivity data for this employee
          const productivity = employeeProductivity.find(
            p => p.employee_id === employee.id || p.employee_id === employee._id
          );

          // Calculate average daily work time (in hours)
          const totalWorkHours = productivity ? (productivity.total_seconds / 3600) : 0;
          const avgDailyHours = totalWorkHours / 7; // Assuming data is for a week
          
          // Calculate non-productive hours
          const nonproductiveHours = productivity ? 
            ((productivity.non_productive_seconds || 0) / 3600) : 0;

          // Determine risk factors
          const isLowWorkTimeRisk = avgDailyHours < 1;
          const isHighNonProductiveRisk = nonproductiveHours > 3;
          
          // Create risk status and details
          let riskStatus = "normal";
          const riskFactors = [];
          
          if (isLowWorkTimeRisk) {
            riskStatus = "high";
            riskFactors.push("low_work_time");
          }
          
          if (isHighNonProductiveRisk) {
            riskStatus = "high";
            riskFactors.push("high_nonproductive");
          }
          
          return {
            ...employee,
            risk_status: riskStatus,
            risk_factors: riskFactors,
            avg_daily_hours: avgDailyHours,
            nonproductive_hours: nonproductiveHours,
            productivity_rate: productivity ? productivity.productivity_rate : 0,
            last_active: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString()
          };
        });

        // Filter to only include risk users
        const onlyRiskUsers = riskyUsers.filter(user => user.risk_status === "high");
        setRiskUsers(onlyRiskUsers);
      } else {
        // Use the dedicated risk-users API response
        const data = await response.json();
        setRiskUsers(data.riskUsers || []);
      }
    } catch (error) {
      console.error("Error fetching risk users:", error);
      toast.error("Failed to load risk users");
      
      // Create mock data for demonstration
      const mockRiskUsers = generateMockRiskUsers();
      setRiskUsers(mockRiskUsers);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockRiskUsers = () => {
    const riskTypes = ["low_work_time", "high_nonproductive", "both"];
    const names = [
      "John Smith", "Sarah Johnson", "Michael Brown", "Emma Wilson", 
      "David Lee", "Lisa Chen", "Robert Taylor", "Amanda Davis",
      "Christopher Martinez", "Jessica Thompson"
    ];
    
    return Array.from({ length: 12 }, (_, i) => {
      const riskType = riskTypes[Math.floor(Math.random() * riskTypes.length)];
      const avgDailyHours = riskType === "low_work_time" || riskType === "both" ? 
        Math.random() * 0.9 : 1 + Math.random() * 4;
      const nonproductiveHours = riskType === "high_nonproductive" || riskType === "both" ? 
        3 + Math.random() * 3 : Math.random() * 2.9;
      const productivityRate = 100 - (nonproductiveHours / (avgDailyHours * 7) * 100);
      
      const riskFactors = [];
      if (riskType === "low_work_time" || riskType === "both") riskFactors.push("low_work_time");
      if (riskType === "high_nonproductive" || riskType === "both") riskFactors.push("high_nonproductive");
      
      return {
        id: `emp-${i+1}`,
        employee_name: names[i % names.length],
        email: names[i % names.length].toLowerCase().replace(" ", ".") + "@example.com",
        department: ["Engineering", "Marketing", "Sales", "HR", "Finance"][Math.floor(Math.random() * 5)],
        position: ["Developer", "Manager", "Analyst", "Specialist", "Assistant"][Math.floor(Math.random() * 5)],
        status: "active",
        risk_status: "high",
        risk_factors: riskFactors,
        avg_daily_hours: avgDailyHours,
        nonproductive_hours: nonproductiveHours,
        productivity_rate: Math.max(0, Math.min(100, productivityRate)),
        last_active: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
      };
    });
  };

  const filterRiskUsers = () => {
    let filtered = [...riskUsers];

    // Filter by risk type
    if (riskType !== "all") {
      filtered = filtered.filter(user => 
        user.risk_factors && user.risk_factors.includes(riskType)
      );
    }

    // Filter by search query (name or email)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          (user.employee_name && user.employee_name.toLowerCase().includes(query)) ||
          (user.first_name && user.first_name.toLowerCase().includes(query)) ||
          (user.last_name && user.last_name.toLowerCase().includes(query)) ||
          (user.email && user.email.toLowerCase().includes(query))
      );
    }

    setFilteredUsers(filtered);
    
    // Calculate total pages
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
    
    // Reset to first page when filters change
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  const getPaginatedUsers = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return name.charAt(0).toUpperCase();
    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getRiskBadge = (riskFactors) => {
    if (!riskFactors || riskFactors.length === 0) return null;
    
    if (riskFactors.includes("low_work_time") && riskFactors.includes("high_nonproductive")) {
      return (
        <Badge variant="destructive" className="bg-red-600">
          Critical Risk
        </Badge>
      );
    } else if (riskFactors.includes("low_work_time")) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Hourglass className="w-3 h-3 mr-1" /> Low Activity
        </Badge>
      );
    } else if (riskFactors.includes("high_nonproductive")) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
          <Clock className="w-3 h-3 mr-1" /> High Unproductive Time
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-red-100 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Risk Users</h1>
            <p className="text-muted-foreground">
              Identify and monitor employees showing potentially risky behavior patterns
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              Total Risk Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {riskUsers.length > 0 ? `${Math.round((riskUsers.length / 25) * 100)}% of workforce` : 'No risk users detected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Hourglass className="h-4 w-4 mr-2 text-amber-500" />
              Low Activity Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskUsers.filter(user => user.risk_factors.includes("low_work_time")).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              &lt; 1 hour average daily activity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <MousePointerClick className="h-4 w-4 mr-2 text-red-500" />
              High Unproductive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskUsers.filter(user => user.risk_factors.includes("high_nonproductive")).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              &gt; 3 hours of unproductive time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
              Critical Risk Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {riskUsers.filter(user => 
                user.risk_factors.includes("low_work_time") && 
                user.risk_factors.includes("high_nonproductive")
              ).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Multiple risk factors detected
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Risk Users</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full md:w-[240px] h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <X
                    className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => setSearchQuery("")}
                  />
                )}
              </div>
              <Select value={riskType} onValueChange={setRiskType}>
                <SelectTrigger className="h-9 w-full md:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by risk type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Types</SelectItem>
                  <SelectItem value="low_work_time">Low Activity</SelectItem>
                  <SelectItem value="high_nonproductive">High Unproductive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin mb-4">
                <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-muted-foreground">Loading risk users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No risk users found</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "All employees are showing healthy work patterns"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Risk Type</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Avg. Daily Hours
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="w-80">
                              <p>Average daily work hours over the past week. Users with less than 1 hour per day are flagged.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        Unproductive Hours
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="w-80">
                              <p>Total unproductive hours over the past week. Users with more than 3 hours are flagged.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedUsers().map((user) => (
                    <TableRow key={user.id || user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.employee_name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(user.employee_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.employee_name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRiskBadge(user.risk_factors)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={user.avg_daily_hours < 1 ? "text-amber-600 font-medium" : ""}>
                            {user.avg_daily_hours.toFixed(1)}h
                          </div>
                          {user.avg_daily_hours < 1 && (
                            <Badge variant="outline" className="bg-amber-50 h-5 text-[10px]">Low</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={user.nonproductive_hours > 3 ? "text-red-600 font-medium" : ""}>
                            {user.nonproductive_hours.toFixed(1)}h
                          </div>
                          {user.nonproductive_hours > 3 && (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 h-5 text-[10px]">High</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full flex items-center gap-2">
                          <Progress 
                            value={user.productivity_rate} 
                            className="h-2" 
                            indicatorClassName={
                              user.productivity_rate < 40 ? "bg-red-500" : 
                              user.productivity_rate < 60 ? "bg-amber-500" : 
                              "bg-green-500"
                            }
                          />
                          <span className="text-xs tabular-nums">{Math.round(user.productivity_rate)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(user.last_active)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(user.last_active)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/employees/${user.id || user._id}`)}
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/activity-monitoring?employee=${user.id || user._id}`)}
                            >
                              View Activity
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, i, array) => (
                      <React.Fragment key={page}>
                        {i > 0 && array[i - 1] !== page - 1 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    ))
                  }
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MoreHorizontal(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
} 