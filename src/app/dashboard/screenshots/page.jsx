"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format, parseISO, subDays } from "date-fns";
import {
  Camera,
  Calendar,
  Search,
  Filter,
  Users,
  RefreshCcw,
  Download,
  ChevronDown,
  Loader2,
  MoreHorizontal,
  XCircle,
  User,
  CalendarIcon,
  Maximize2,
  Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function ScreenshotsPage() {
  const router = useRouter();
  const [screenshots, setScreenshots] = useState([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchScreenshots();
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterScreenshots();
  }, [screenshots, employeeFilter, searchQuery, dateRange]);

  const fetchScreenshots = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/screenshots", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch screenshots");
      }

      const data = await response.json();
      setScreenshots(data.screenshots || []);
    } catch (error) {
      console.error("Error fetching screenshots:", error);
      toast.error("Failed to load screenshots");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employees", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const filterScreenshots = () => {
    let filtered = [...screenshots];

    // Filter by employee
    if (employeeFilter !== "all") {
      filtered = filtered.filter((screenshot) => 
        screenshot.employee_id.toString() === employeeFilter
      );
    }

    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter((screenshot) => {
        const screenshotDate = parseISO(screenshot.timestamp);
        return screenshotDate >= dateRange.from;
      });
    }
    
    if (dateRange.to) {
      filtered = filtered.filter((screenshot) => {
        const screenshotDate = parseISO(screenshot.timestamp);
        return screenshotDate <= dateRange.to;
      });
    }

    // Search by employee name
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((screenshot) => {
        const employee = employees.find(e => e.id === screenshot.employee_id);
        return employee && 
          employee.employee_name.toLowerCase().includes(query);
      });
    }

    setFilteredScreenshots(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
    
    // Reset to first page when filters change
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  const getPaginatedScreenshots = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredScreenshots.slice(startIndex, endIndex);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return format(date, "MMM d, yyyy h:mm a");
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.employee_name : "Unknown Employee";
  };

  const getInitials = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return "??";
    
    // Get initials from employee_name (first letter of each word)
    const nameParts = employee.employee_name?.split(' ') || [];
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0) || ""}${nameParts[1].charAt(0) || ""}`.toUpperCase();
    } else if (nameParts.length === 1) {
      return `${nameParts[0].charAt(0) || ""}`.toUpperCase();
    }
    return "??";
  };

  const handleImportExisting = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await fetch("/api/screenshots/import-api", {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to import existing screenshots");
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || "Successfully imported existing screenshots");
        // Refresh the screenshots list
        fetchScreenshots();
      } else {
        toast.error(data.error || "Failed to import screenshots");
      }
    } catch (error) {
      console.error("Error importing screenshots:", error);
      toast.error("Failed to import screenshots: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchScreenshots();
    toast.success("Screenshots refreshed");
  };

  const handleDownload = (url) => {
    window.open(url, "_blank");
  };

  const handleDateRangeSelect = (range) => {
    setDateRange(range);
    setCalendarOpen(false);
  };

  const getDateRangeText = () => {
    if (!dateRange.from && !dateRange.to) return "All Time";
    if (dateRange.from && !dateRange.to) return `Since ${format(dateRange.from, 'MMM d, yyyy')}`;
    if (!dateRange.from && dateRange.to) return `Until ${format(dateRange.to, 'MMM d, yyyy')}`;
    
    return `${format(dateRange.from, 'MMM d, yyyy')} - ${format(dateRange.to, 'MMM d, yyyy')}`;
  };

  // Mock data for development/testing
  const mockScreenshots = [
    {
      id: 1,
      employee_id: 1,
      url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
      timestamp: "2023-06-10T09:30:00Z",
      created_at: "2023-06-10T09:30:00Z"
    },
    {
      id: 2,
      employee_id: 2,
      url: "https://images.unsplash.com/photo-1593642532744-d377ab507dc8",
      timestamp: "2023-06-10T10:00:00Z",
      created_at: "2023-06-10T10:00:00Z"
    },
    {
      id: 3,
      employee_id: 1,
      url: "https://images.unsplash.com/photo-1550439062-609e1531270e",
      timestamp: "2023-06-10T10:30:00Z",
      created_at: "2023-06-10T10:30:00Z"
    },
    {
      id: 4,
      employee_id: 3,
      url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12",
      timestamp: "2023-06-10T11:00:00Z",
      created_at: "2023-06-10T11:00:00Z"
    }
  ];

  // Use mock data if API data is empty
  useEffect(() => {
    if (!isLoading && screenshots.length === 0) {
      setScreenshots(mockScreenshots);
    }
  }, [isLoading]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Camera className="h-7 w-7 text-primary" />
            Screenshots
          </h1>
          <p className="text-muted-foreground mt-1">
            View periodic screenshots of employee monitors to ensure productivity and compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleImportExisting} disabled={isLoading}>
            <Clock className="h-4 w-4 mr-2" />
            Import Existing
          </Button>
          <Button onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="px-6 py-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getDateRangeText()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="flex-1 text-left truncate">
                      {employeeFilter === "all" 
                        ? "All Employees" 
                        : getEmployeeName(parseInt(employeeFilter))}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.employee_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ScreenshotSkeleton key={i} />
              ))}
            </div>
          ) : getPaginatedScreenshots().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Camera className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold">No screenshots found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getPaginatedScreenshots().map((screenshot) => (
                <ScreenshotCard
                  key={screenshot.id}
                  screenshot={screenshot}
                  employeeName={getEmployeeName(screenshot.employee_id)}
                  initials={getInitials(screenshot.employee_id)}
                  formatDate={formatDate}
                  onView={() => setSelectedImage(screenshot)}
                  onDownload={() => handleDownload(screenshot.url)}
                />
              ))}
            </div>
          )}

          {filteredScreenshots.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{getPaginatedScreenshots().length}</span> of{" "}
                <span className="font-medium">{filteredScreenshots.length}</span> screenshots
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  {totalPages > 5 && currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        onClick={() => setCurrentPage(totalPages)}
                        isActive={currentPage === totalPages}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for viewing large screenshots */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>{getInitials(selectedImage.employee_id)}</AvatarFallback>
                  </Avatar>
                  <span>{getEmployeeName(selectedImage.employee_id)}</span>
                </div>
                <Badge variant="outline" className="ml-2 text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDate(selectedImage.timestamp)}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="relative aspect-video overflow-hidden rounded-md">
              <Image
                src={`/api/screenshot-file?name=${encodeURIComponent(selectedImage.url.split('/').pop())}`}
                alt={`Screenshot of ${getEmployeeName(selectedImage.employee_id)}'s screen`}
                className="object-contain"
                fill
                unoptimized={true}
                onError={(e) => {
                  console.error(`Failed to load image in modal: ${selectedImage.url}`);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                className="absolute inset-0 hidden flex-col items-center justify-center bg-muted p-4 text-center"
                style={{ display: 'none' }}
              >
                <Camera className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Image could not be loaded</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button onClick={() => handleDownload(selectedImage.url)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ScreenshotSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow">
      <div className="relative aspect-video bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenshotCard({ screenshot, employeeName, initials, formatDate, onView, onDownload }) {
  const [imageError, setImageError] = useState(false);
  
  // Function to handle image loading errors
  const handleImageError = () => {
    console.error(`Failed to load image: ${screenshot.url}`);
    setImageError(true);
  };
  
  return (
    <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow">
      <div 
        className="relative aspect-video bg-muted cursor-pointer overflow-hidden group"
        onClick={onView}
      >
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4 text-center">
            <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Image unavailable</p>
          </div>
        ) : (
          <>
            <Image
              src={`/api/screenshot-file?name=${encodeURIComponent(screenshot.url.split('/').pop())}`}
              alt={`Screenshot of ${employeeName}'s screen`}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              onError={handleImageError}
              unoptimized={true} // Skip optimization for external URLs
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" className="bg-background/80 hover:bg-background/90">
                <Maximize2 className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none mb-1">{employeeName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(screenshot.timestamp)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open actions menu">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onView}>View Full Screen</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDownload}>Download</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 