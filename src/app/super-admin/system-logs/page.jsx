"use client";

import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function SystemLogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">System Logs</h1>
        <Button  className="border-slate-700 text-white hover:text-white">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search logs..." 
            className="pl-8 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Log Level" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="today">
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        <Button className="border-slate-700 text-white hover:text-white">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="pb-3">
          <CardTitle>All System Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="text-white">
            <TableHeader className="bg-slate-800/50">
              <TableRow className="border-slate-700 hover:bg-slate-800">
                <TableHead className="text-slate-400">Timestamp</TableHead>
                <TableHead className="text-slate-400">Level</TableHead>
                <TableHead className="text-slate-400">Source</TableHead>
                <TableHead className="text-slate-400 w-[40%]">Message</TableHead>
                <TableHead className="text-slate-400">User</TableHead>
                <TableHead className="text-slate-400">IP Address</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemLogs.map((log, i) => (
                <TableRow key={i} className="border-slate-700 hover:bg-slate-800">
                  <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                  <TableCell>
                    <LogLevelBadge level={log.level} />
                  </TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell className="font-mono text-xs max-w-md truncate">{log.message}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-700" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function LogLevelBadge({ level }) {
  const badgeStyles = {
    info: {
      className: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
      icon: <Info className="h-3 w-3 mr-1" />
    },
    warning: {
      className: "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30",
      icon: <AlertTriangle className="h-3 w-3 mr-1" />
    },
    error: {
      className: "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30",
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    success: {
      className: "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30",
      icon: <CheckCircle className="h-3 w-3 mr-1" />
    }
  };

  const badge = badgeStyles[level] || badgeStyles.info;

  return (
    <Badge className={badge.className}>
      <div className="flex items-center">
        {badge.icon}
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </div>
    </Badge>
  );
}

// Sample system logs data
const systemLogs = [
  { 
    timestamp: "2023-06-01 14:32:45", 
    level: "error", 
    source: "Authentication", 
    message: "Failed login attempt for user admin@trackpro.com", 
    user: "Unknown", 
    ip: "192.168.1.105" 
  },
  { 
    timestamp: "2023-06-01 14:30:22", 
    level: "info", 
    source: "UserService", 
    message: "User profile updated successfully", 
    user: "john.smith@techcorp.com", 
    ip: "192.168.1.42" 
  },
  { 
    timestamp: "2023-06-01 14:28:17", 
    level: "warning", 
    source: "DatabaseService", 
    message: "High database load detected - 85% CPU utilization", 
    user: "System", 
    ip: "Internal" 
  },
  { 
    timestamp: "2023-06-01 14:25:01", 
    level: "info", 
    source: "OrganizationService", 
    message: "New organization created: Quantum Innovations", 
    user: "admin@trackpro.com", 
    ip: "192.168.1.10" 
  },
  { 
    timestamp: "2023-06-01 14:22:36", 
    level: "error", 
    source: "PaymentService", 
    message: "Payment processing failed for organization: DataFlow Solutions", 
    user: "System", 
    ip: "Internal" 
  },
  { 
    timestamp: "2023-06-01 14:20:14", 
    level: "info", 
    source: "AuthService", 
    message: "Admin user logged in successfully", 
    user: "admin@trackpro.com", 
    ip: "192.168.1.10" 
  },
  { 
    timestamp: "2023-06-01 14:15:55", 
    level: "success", 
    source: "BackupService", 
    message: "System backup completed successfully", 
    user: "System", 
    ip: "Internal" 
  },
]; 