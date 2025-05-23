"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar as CalendarIcon, 
  Building, 
  Search, 
  ArrowUpDown,
  Info
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function HolidaysPage() {
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Years for filtering
  const years = [
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1
  ];

  useEffect(() => {
    // Fetch holidays from API
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) throw new Error('Authentication token not found. Please log in again.');
        const response = await fetch(`/api/holiday-management?year=${yearFilter}`, {
          headers: {
            'x-auth-token': token
          }
        });
        if (!response.ok) throw new Error('Failed to fetch holidays');
        const data = await response.json();
        if (data.holidays) {
          setHolidays(data.holidays);
        } else {
          setHolidays([]);
        }
        setLoading(false);
      } catch (error) {
        setHolidays([]);
        setLoading(false);
      }
    };
    fetchHolidays();
  }, [yearFilter]);

  useEffect(() => {
    // Filter and sort holidays based on filters and sort criteria
    filterAndSortHolidays();
  }, [holidays, yearFilter, sortField, sortDirection]);

  const filterAndSortHolidays = () => {
    const filtered = holidays.filter((holiday) => {
      const holidayYear = new Date(holiday.date).getFullYear().toString();
      
      const matchesYear = yearFilter === "" || holidayYear === yearFilter;
      
      return matchesYear;
    });
    
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === "date") {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "type") {
        comparison = a.type.localeCompare(b.type);
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    setFilteredHolidays(sorted);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isUpcoming = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date >= today;
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!filteredHolidays.length) return;
    const headers = [
      "ID",
      "Title",
      "Date",
      "Type",
      "Status"
    ];
    const rows = filteredHolidays.map(holiday => [
      holiday.id,
      `"${(holiday.title || '').replace(/"/g, '""')}"`,
      holiday.date,
      `"${(holiday.type || '').replace(/"/g, '""')}"`,
      isUpcoming(holiday.date) ? "Upcoming" : "Passed"
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "holidays.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-primary drop-shadow-sm">Holidays</h1>
        <Button variant="outline" className="shadow hover:shadow-md transition-all rounded-lg" onClick={handleExportCSV}>Export Calendar</Button>
      </div>

      <Card className="border border-border/60 shadow-lg rounded-2xl bg-gradient-to-br from-white/90 to-blue-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-primary">Company Holidays</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            View all holidays across organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-[120px] rounded-lg">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : filteredHolidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No holidays found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                There are no holidays matching your filters
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-blue-50/60">
                  <TableRow>
                    <TableHead>
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <span>Date</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("title")}
                      >
                        <span>Holiday Name</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div 
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => handleSort("type")}
                      >
                        <span>Type</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHolidays.map((holiday) => (
                    <TableRow key={holiday.id} className="hover:bg-blue-50/30 transition-all">
                      <TableCell>
                        {formatDate(holiday.date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {holiday.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={holiday.type === "Public Holiday" ? "secondary" : "outline"} className="rounded-full px-3 py-1 text-xs">
                          {holiday.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant="outline"
                          className={cn(
                            isUpcoming(holiday.date) 
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          ) + " rounded-full px-3 py-1 text-xs"}
                        >
                          {isUpcoming(holiday.date) ? "Upcoming" : "Passed"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 