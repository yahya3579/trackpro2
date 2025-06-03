"use client";

import { useState, useEffect } from "react";
import { PageTemplate } from "../components/page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, Upload, Pencil } from "lucide-react";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function HolidayManagementPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedType, setSelectedType] = useState("all");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form & dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentHolidayId, setCurrentHolidayId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date(),
    type: "public",
    session: "full_day",
    assignedToAll: true,
  });

  // Generate past 6 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(holidays.length / pageSize);
  const paginatedHolidays = holidays.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    fetchHolidays();
    setPage(1); // Reset to first page when filters change
  }, [selectedYear, selectedType]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let url = `/api/holiday-management?year=${selectedYear}`;
      if (selectedType && selectedType !== 'all') url += `&type=${selectedType}`;
      const res = await fetch(url, {
        headers: { "x-auth-token": token }
      });
      const data = await res.json();
      setHolidays(res.ok ? data.holidays || [] : []);
    } catch (err) {
      console.error("Error fetching holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFormAndCloseDialog = () => {
    setFormData({ title: "", date: new Date(), type: "public", session: "full_day", assignedToAll: true });
    setIsDialogOpen(false);
    setIsEditing(false);
    setCurrentHolidayId(null);
  };

  const openAddDialog = () => {
    resetFormAndCloseDialog();
    setIsDialogOpen(true);
  };

  const openEditDialog = (holiday) => {
    setIsEditing(true);
    setCurrentHolidayId(holiday.id);
    setFormData({
      title: holiday.title,
      date: new Date(holiday.date),
      type: holiday.type,
      session: holiday.session,
      assignedToAll: Boolean(holiday.assigned_to_all || holiday.assignedToAll),
    });
    setIsDialogOpen(true);
  };

  const handleAddHoliday = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = { ...formData, date: format(formData.date, "yyyy-MM-dd") };
      const res = await fetch("/api/holiday-management", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-token": token },
        body: JSON.stringify(payload),
      });
      if (res.ok) fetchHolidays();
    } catch (err) {
      console.error(err);
    } finally {
      resetFormAndCloseDialog();
    }
  };

  const handleUpdateHoliday = async () => {
    try {
      const payload = { id: currentHolidayId, ...formData, date: format(formData.date, "yyyy-MM-dd") };
      const res = await fetch("/api/holiday-management", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) fetchHolidays();
    } catch (err) {
      console.error(err);
    } finally {
      resetFormAndCloseDialog();
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/holiday-management?id=${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.ok) fetchHolidays();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageTemplate title="Holiday Management" description="Set up and manage company holidays, time-off policies, and special leave days." iconName="Briefcase">
      <div className="w-full bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4 mb-8">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[120px]">{selectedYear}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-[120px] p-0">
              <div className="flex flex-col">
                {years.map((y) => (
                  <Button key={y} variant="ghost" className="justify-start" onClick={() => setSelectedYear(y)}>{y}</Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select Holiday Type"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="public">Public Holiday</SelectItem>
              <SelectItem value="office">Office Holiday</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-grow"/>

          <Button className="gap-2" onClick={openAddDialog}>
            <Plus size={16}/> Add Holiday
          </Button>
        </div>

        {/* Dialog for Add/Edit */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetFormAndCloseDialog()}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Holiday" : "Add New Holiday"}</DialogTitle>
              <DialogDescription>{isEditing ? "Update holiday information" : "Create a new holiday for the organization."}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Date picker */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Date</label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {formData.date ? format(formData.date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={formData.date} onSelect={(date) => setFormData({ ...formData, date })} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Title</label>
                <Input className="col-span-3" placeholder="Holiday title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>

              {/* Session */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Session</label>
                <Select value={formData.session} onValueChange={(val) => setFormData({ ...formData, session: val })} className="col-span-3">
                  <SelectTrigger><SelectValue placeholder="Select session"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_day">Full Day</SelectItem>
                    <SelectItem value="half_day_first">Half Day - 1st Half</SelectItem>
                    <SelectItem value="half_day_second">Half Day - 2nd Half</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Type</label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })} className="col-span-3">
                  <SelectTrigger><SelectValue placeholder="Select type"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public Holiday</SelectItem>
                    <SelectItem value="office">Office Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assign to all */}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-start-2 col-span-3 flex items-center space-x-2">
                  <Switch checked={formData.assignedToAll} onCheckedChange={(checked) => setFormData({ ...formData, assignedToAll: checked })} />
                  <label>Assign this holiday to all members</label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetFormAndCloseDialog}>Cancel</Button>
              <Button onClick={isEditing ? handleUpdateHoliday : handleAddHoliday}>{isEditing ? "Update" : "Add"} Holiday</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Holiday list */}
        {loading ? (
          <div className="text-center py-8">Loading holidays...</div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-16 text-gray-500">You are yet to add your first holiday for {selectedYear}!</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedHolidays.map((holiday) => (
                <div key={holiday.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between">
                    <div className="text-sm text-gray-500">{format(new Date(holiday.date), "PPP")}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${holiday.type === 'public' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{holiday.type === 'public' ? 'Public Holiday' : 'Office Holiday'}</div>
                  </div>
                  <div className="mt-2 font-medium">{holiday.title}</div>
                  <div className="mt-1 text-sm">{holiday.session === 'full_day' ? 'Full Day' : holiday.session === 'half_day_first' ? 'Half Day (1st Half)' : 'Half Day (2nd Half)'}</div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => openEditDialog(holiday)}>
                      <Pencil size={14}/> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteHoliday(holiday.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page === 1}
                        tabIndex={page === 1 ? -1 : 0}
                        style={{ pointerEvents: page === 1 ? 'none' : undefined, opacity: page === 1 ? 0.5 : 1 }}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={page === i + 1}
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        aria-disabled={page === totalPages}
                        tabIndex={page === totalPages ? -1 : 0}
                        style={{ pointerEvents: page === totalPages ? 'none' : undefined, opacity: page === totalPages ? 0.5 : 1 }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </PageTemplate>
  );
}
