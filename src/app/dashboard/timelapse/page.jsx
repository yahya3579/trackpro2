"use client";

import { useState, useEffect, useRef } from "react";
import { format, parseISO, subDays } from "date-fns";
import {
  Camera,
  Calendar,
  PlayCircle,
  PauseCircle,
  FastForward,
  Rewind,
  Maximize2,
  Loader2,
  User,
  ChevronDown,
  Clock,
  RefreshCcw,
  CalendarIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Helper to format screenshot URLs
function formatImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/screenshots/")) return url;
  return `/screenshots/${url}`;
}

// Helper to format screenshot URLs for API route
function getScreenshotApiUrl(url) {
  if (!url) return "";
  const filename = url.split('/').pop();
  return `/api/screenshot-file?name=${encodeURIComponent(filename)}`;
}

export default function TimelapsePage() {
  const [screenshots, setScreenshots] = useState([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const timerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    fetchScreenshots();
    fetchEmployees();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    filterScreenshots();
  }, [screenshots, employeeFilter, dateRange]);

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    } else {
      stopPlayback();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, filteredScreenshots]);

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
      
      // Sort screenshots by timestamp in ascending order
      const sorted = (data.screenshots || []).sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      setScreenshots(sorted);
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

    setFilteredScreenshots(filtered);
    setCurrentImageIndex(0);
  };

  const startPlayback = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (filteredScreenshots.length <= 1) {
      setIsPlaying(false);
      return;
    }

    // Calculate the interval based on playback speed (milliseconds)
    // Base interval of 1000ms (1 second) adjusted by speed
    const interval = 1000 / playbackSpeed;

    timerRef.current = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        if (prevIndex >= filteredScreenshots.length - 1) {
          // If we reach the end, stop playback or loop
          // setIsPlaying(false);
          return 0; // Loop back to the beginning
        }
        return prevIndex + 1;
      });
    }, interval);
  };

  const stopPlayback = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (value) => {
    setPlaybackSpeed(value[0]);
  };

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex >= filteredScreenshots.length - 1) {
        return 0; // Loop back to the beginning
      }
      return prevIndex + 1;
    });
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) => {
      if (prevIndex <= 0) {
        return filteredScreenshots.length - 1; // Loop to the end
      }
      return prevIndex - 1;
    });
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.employee_name : "Unknown";
  };

  const getInitials = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return "?";
    
    const name = employee.employee_name || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleDateRangeSelect = (range) => {
    setDateRange(range);
    setCalendarOpen(false);
  };

  const getDateRangeText = () => {
    if (!dateRange.from && !dateRange.to) return "All Time";
    
    const fromStr = dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "";
    const toStr = dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "";
    
    if (fromStr && toStr) return `${fromStr} to ${toStr}`;
    if (fromStr) return `From ${fromStr}`;
    if (toStr) return `Until ${toStr}`;
    
    return "Custom Range";
  };

  const handleRefresh = () => {
    fetchScreenshots();
  };

  const currentScreenshot = filteredScreenshots[currentImageIndex];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timelapse Viewer</h1>
          <p className="text-muted-foreground">
            View employee screenshots in a timelapse sequence.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal w-[240px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateRangeText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem 
                  key={employee.id} 
                  value={employee.id.toString()}
                >
                  {employee.employee_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredScreenshots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
            <Camera className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No screenshots available</h3>
            <p className="text-muted-foreground">
              No screenshots were found with the current filters.
            </p>
            <Button onClick={handleRefresh}>Refresh</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Timelapse Viewer */}
          <Card>
            <CardHeader>
              <CardTitle>Timelapse Viewer</CardTitle>
              <CardDescription>
                Viewing {filteredScreenshots.length} screenshots
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Screenshot Display */}
              <div className="relative rounded-lg border overflow-hidden bg-muted/30 flex items-center justify-center min-h-[400px]">
                {currentScreenshot ? (
                  <>
                    <img
                      ref={imageRef}
                      src={getScreenshotApiUrl(currentScreenshot.url)}
                      alt={`Screenshot ${currentImageIndex + 1}`}
                      className="max-w-full max-h-[400px] object-contain"
                      onError={(e) => {
                        e.target.src = "/placeholder-screenshot.png";
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white text-sm flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {getInitials(currentScreenshot.employee_id)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{getEmployeeName(currentScreenshot.employee_id)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(currentScreenshot.timestamp)}</span>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50 text-white"
                          onClick={() => setFullScreenImage(currentScreenshot)}
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-screen-lg">
                        <DialogHeader>
                          <DialogTitle>
                            Screenshot - {getEmployeeName(currentScreenshot.employee_id)}
                          </DialogTitle>
                          <DialogDescription>
                            {formatDate(currentScreenshot.timestamp)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center">
                          <img
                            src={getScreenshotApiUrl(currentScreenshot.url)}
                            alt={`Screenshot ${currentImageIndex + 1}`}
                            className="max-w-full object-contain"
                            onError={(e) => {
                              e.target.src = "/placeholder-screenshot.png";
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    No image available
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col md:flex-row items-center gap-4 py-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevious}
                    title="Previous screenshot"
                  >
                    <Rewind className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={handlePlayPause}
                    variant="default"
                    className="w-32"
                  >
                    {isPlaying ? (
                      <>
                        <PauseCircle className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Play
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    title="Next screenshot"
                  >
                    <FastForward className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 flex items-center gap-2 min-w-[200px] max-w-md">
                  <span className="text-sm min-w-[60px]">Speed: {playbackSpeed}x</span>
                  <Slider
                    defaultValue={[1]}
                    min={0.25}
                    max={4}
                    step={0.25}
                    value={[playbackSpeed]}
                    onValueChange={handleSpeedChange}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {currentImageIndex + 1} of {filteredScreenshots.length}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Screenshot Thumbnails */}
          <Card>
            <CardHeader>
              <CardTitle>Screenshots Timeline</CardTitle>
              <CardDescription>
                Click on a thumbnail to view it in the timelapse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-auto max-h-[300px] p-1">
                {filteredScreenshots.map((screenshot, index) => (
                  <div 
                    key={screenshot.id || index}
                    className={`relative rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      index === currentImageIndex ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-primary/40"
                    }`}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setIsPlaying(false);
                    }}
                  >
                    <img
                      src={getScreenshotApiUrl(screenshot.url)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-24 object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-screenshot.png";
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-white text-xs">
                      {format(new Date(screenshot.timestamp), "h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 