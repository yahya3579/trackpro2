import { 
  Clock, 
  Download, 
  Search, 
  Filter, 
  User, 
  Play, 
  Pause, 
  BarChart3, 
  PieChart 
} from "lucide-react";
import { PageTemplate } from "../components/page-template";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Time Tracking | TrackPro",
  description: "Track employee work hours and attendance",
};

export default function TimeTrackingPage() {
  return (
    <PageTemplate
      title="Time Tracking"
      description="Monitor employee work hours and attendance"
      iconName="Clock"
      actions={
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <CardTitle>Total Hours</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">217.5h</div>
            <p className="text-xs text-slate-400 mt-1">This week across all employees</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-emerald-400" />
              <CardTitle>Active Now</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-xs text-slate-400 mt-1">Employees currently active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-amber-400" />
              <CardTitle>Average</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7.25h</div>
            <p className="text-xs text-slate-400 mt-1">Daily average per employee</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search employees..." 
            className="pl-8 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
          />
        </div>
        <Button className="border-slate-700 text-white hover:text-white">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>
      
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription className="text-slate-400">
            Current and recent time tracking entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="text-white">
            <TableHeader className="bg-slate-800/50">
              <TableRow className="border-slate-700 hover:bg-slate-800">
                <TableHead className="text-slate-400">Employee</TableHead>
                <TableHead className="text-slate-400">Clock In</TableHead>
                <TableHead className="text-slate-400">Clock Out</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry, i) => (
                <TableRow key={i} className="border-slate-700 hover:bg-slate-800">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p>{entry.employee}</p>
                        <p className="text-xs text-slate-400">{entry.department}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{entry.clockIn}</TableCell>
                  <TableCell>{entry.clockOut}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell>
                    <Badge className={
                      entry.status === "Active" 
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : entry.status === "Completed" 
                        ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                    }>
                      {entry.status === "Active" && <Play className="h-3 w-3 mr-1" />}
                      {entry.status === "Paused" && <Pause className="h-3 w-3 mr-1" />}
                      {entry.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700" size="sm">
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>Weekly Summary</CardTitle>
          <CardDescription className="text-slate-400">
            Hours tracked in the current week
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center bg-slate-800/50 rounded-md">
          <div className="text-center text-slate-400">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Weekly hours chart visualization would appear here</p>
          </div>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}

// Sample time entries data
const timeEntries = [
  {
    employee: "John Doe",
    department: "Engineering",
    clockIn: "08:30 AM",
    clockOut: "—",
    duration: "3h 15m",
    status: "Active"
  },
  {
    employee: "Jane Smith",
    department: "Design",
    clockIn: "09:15 AM",
    clockOut: "—",
    duration: "2h 30m",
    status: "Paused"
  },
  {
    employee: "Mike Johnson",
    department: "Marketing",
    clockIn: "08:00 AM",
    clockOut: "12:30 PM",
    duration: "4h 30m",
    status: "Completed"
  },
  {
    employee: "Sarah Williams",
    department: "Customer Support",
    clockIn: "09:00 AM",
    clockOut: "—",
    duration: "2h 45m",
    status: "Active"
  },
  {
    employee: "David Brown",
    department: "Sales",
    clockIn: "10:15 AM",
    clockOut: "—",
    duration: "1h 30m",
    status: "Active"
  },
]; 